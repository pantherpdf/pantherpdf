import flask
import shutil
import threading
import time
import os
import watermark
import chromeHelper
import signal
import random
import string
import dotenv   # pip install python-dotenv
import hmac
import hashlib


# env file
dotenv.load_dotenv()
SECRET = os.getenv('WORKER_SECRET')
assert isinstance(SECRET, str) and len(SECRET) > 0


# find chrome path
chromePth = None
if not chromePth:
	chromePth = shutil.which('chromium')
if not chromePth:
	chromePth = shutil.which('chrome')
if not chromePth:
	chromePth = shutil.which('google-chrome')
if not chromePth:
	chromePth = shutil.which('google chrome')
assert chromePth
print('Found chrome path: ', chromePth)
# test chrome
chromeHelper.testChrome(chromePth)


# list of tmp documents
# id -> { url, status, errorMsg, time, keepUntil, path }
tmpDocuments = {}
mutexTmpFiles = threading.Lock()


# web server
app = flask.Flask(__name__)


# where to save PDFs
#pthDir = tempfile.gettempdir()
pthDir = '/app/pdf'
try:
	os.mkdir(pthDir)
except FileExistsError:
	pass



# thread for converting
def convertThrd(data, id2):
	global mutexTmpFiles, tmpDocuments

	with mutexTmpFiles:
		data['status'] = 'working'

	targetPath = data['path']
	print('Printig ', data['properties']['url'], ' to ', targetPath)

	try:
		# convert
		chromeHelper.convertHtmlToPdf(chromePth, data['properties'], targetPath)

		# add watermark
		x = { 'text': 'KELGRAND Reports' }
		if x:
			print('html-pdf adding watermark')
			txt = x['text']
			os.replace(targetPath, targetPath+'.old.pdf')
			watermark.addWatermark(targetPath+'.old.pdf', targetPath, txt)
			assert os.path.isfile(targetPath)
			try:
				os.remove(targetPath+'.old.pdf')
			except FileNotFoundError:
				pass
			
		#
		print('PDF ok')
		with mutexTmpFiles:
			data['status'] = 'finished'

	# handle error
	except Exception as ex:
		with mutexTmpFiles:
			data['status'] = 'finished'
			data['errorMsg'] = str(ex)
			print(data['errorMsg'])
		


# delete old pdf files in temp dir (are not in tmpDocuments)
def deleteOldPdfs():
	global pthDir
	oldPdfFiles = [f for f in os.listdir(pthDir) if os.path.isfile(os.path.join(pthDir, f))]
	oldPdfFiles = [f for f in oldPdfFiles if f.endswith('.pdf')]
	for f in oldPdfFiles:
		print('Deleting old PDF file '+f)
		try:
			os.remove(os.path.join(pthDir, f))
		except FileNotFoundError:
			pass


# function to clean old documents
def doClean():
	global tmpDocuments
	tm = time.time()
	with mutexTmpFiles:
		toDelete = [id2 for id2 in tmpDocuments.keys() if tmpDocuments[id2]['keepUntil'] < tm]
		for id2 in toDelete:
			# delete pdf file
			pth = tmpDocuments[id2]['path']
			print(f'Delete {pth}')
			try:
				os.remove(pth)
			except FileNotFoundError:
				pass
			# delete entry
			del tmpDocuments[id2]



# timer to schedule regular cleaning
def startCleaningJob():
	cleanEvent = threading.Event()
	def thread_cb():
		while True:
			willClose = cleanEvent.wait(timeout=30)  # True-end of program    False-timeout
			if willClose:
				break
			doClean()
	t = threading.Thread(target=thread_cb)
	t.start()
	def exit_gracefully(*args):
		cleanEvent.set()
	signal.signal(signal.SIGINT, exit_gracefully)  # todo check if using signals this way is ok
	signal.signal(signal.SIGTERM, exit_gracefully)



def sign(msg, secret_key):
	if isinstance(msg, str):
		msg = msg.encode('utf-8')
	assert isinstance(msg, bytes)
	if isinstance(secret_key, str):
		secret_key = secret_key.encode('utf-8')
	assert isinstance(secret_key, bytes)
	return hmac.new(secret_key, msg=msg, digestmod=hashlib.sha256).hexdigest()



def verify(msg, secret_key, signature_verify):
	signature_calc = sign(msg, secret_key)
	return hmac.compare_digest(signature_calc, signature_verify)



def getStatus(id2):
	global mutexTmpFiles, tmpDocuments
	assert mutexTmpFiles.locked()
	# caller should encolse this function inside try / except
	obj = tmpDocuments[id2]
	res = {
		'id': id2,
		'status': obj['status'],
	}
	if obj['errorMsg']:
		res['errorMsg'] = obj['errorMsg']
	return res



@app.route('/apiv1/convert', methods=['POST'])
def apiConvert():
	global pthDir, mutexTmpFiles, tmpDocuments

	# get request signature
	signature_verify = flask.request.headers.get('x-signature') or ''

	# verify signature
	rqBody = flask.request.get_data()
	if not verify(rqBody, SECRET, signature_verify):
		return {'msg':'Bad or missing header x-signature'}, 403

	# verify request
	rqJs = flask.request.json
	if not isinstance(rqJs, dict):
		return {'msg':'Bad request body'}, 400
	if 'url' not in rqJs or not isinstance(rqJs['url'], str):
		return {'msg':'Missing or bad url in request'}, 400
	url = rqJs['url']
	if not url.startswith('https://') and not url.startswith('http://'):
		return {'msg':'Bad url protocol'}, 400
	# todo check valid url
	# do not allow localhost or 127.0.0.1 or ::1 or ::1/128 or similar
	if 'fileName' in rqJs:
		# todo validate fileName
		pass

	print('Got request', rqJs)

	js = {
		'properties': rqJs,
		'status': 'waiting',
		'errorMsg': None,
		'time': time.time(),
		'keepUntil': time.time() + 60*60*15,  # keep 15 min
		'path': None,
	}

	# random id
	with mutexTmpFiles:
		while True:
			id2 = ''.join(random.choices(string.ascii_uppercase + string.digits, k=128))
			if id2 not in tmpDocuments:
				break
		js['path'] = os.path.join(pthDir, f'{id2}.pdf')
		tmpDocuments[id2] = js

		t = threading.Thread(target=convertThrd, args=(js, id2))
		t.daemon = True
		t.start()

		return getStatus(id2), 200



@app.route('/apiv1/status/<id2>', methods=['GET'])
def apiStatus(id2):
	global mutexTmpFiles, tmpDocuments
	with mutexTmpFiles:
		try:
			return getStatus(id2), 200
		except KeyError:
			return {'msg':'id doesnt exist'}, 404



@app.route('/apiv1/download/<id2>', methods=['GET'])
def apiDownload(id2):
	global mutexTmpFiles, tmpDocuments, app
	with mutexTmpFiles:
		try:
			obj = tmpDocuments[id2]
		except KeyError:
			return {'msg':'document doesnt exist'}, 404
		if obj['status'] != 'finished':
			return {'msg':'document is not finished yet.'}, 400
		if obj['errorMsg']:
			return {'msg':'Document is not available due to error: '+obj['errorMsg']}, 400
		docTimeStr = str(round(obj['time'], 0))
		fileName = obj['properties']['fileName'] if 'fileName' in obj['properties'] else f'report-{docTimeStr}.pdf'
		do_download = flask.request.args.get('download') != None
		return flask.send_file(obj['path'], mimetype='application/pdf', as_attachment=do_download, download_name=fileName), 200



@app.errorhandler(404)
def apiErrorNotFound(e):
	return {'msg': str(e)}, 404



@app.errorhandler(500)
def apiErrorServer(e):
	return {'msg': str(e)}, 500



# start server
if __name__ == '__main__':
	deleteOldPdfs()
	startCleaningJob()
	app.run(host='0.0.0.0', port=80)
