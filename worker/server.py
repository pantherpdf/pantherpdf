from flask import Flask
import shutil
import threading
import time
import os
import watermark
import chromeHelper
import signal
import random
import string


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
app = Flask(__name__)


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
	url = data['url']
	print('Printig ', url, ' to ', targetPath)

	try:
		# convert
		chromeHelper.convertHtmlToPdf(chromePth, data, targetPath)

		# add watermark
		x = { 'text': 'KELGRAND Reports' }
		if x:
			print('html-pdf adding watermark')
			txt = x['text']
			os.replace(targetPath, targetPath+'-old')
			watermark.addWatermark(targetPath+'-old', targetPath, txt)
			assert os.path.isfile(targetPath)
			try:
				os.remove(targetPath+'-old')
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
	oldPdfFiles = [f for f in oldPdfFiles if f.startswith('kelgrand-html-pdf-') and f.endswith('.pdf')]
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



@app.route('/')
def hello_world():
	return 'Hello, World!', 200


@app.route('/apiv1/convert', methods=['POST'])
def apiConvert():
	global pthDir, mutexTmpFiles, tmpDocuments

	js = {
		'url': 'http://www.google.com/',
		'status': 'waiting',
		'errorMsg': None,
		'time': time.time(),
		'keepUntil': time.time() + 60*60*15,  # keep 15 min
		'path': None,
	}
	print('Got requeest', js)

	# check valid url
	# do not allow localhost or 127.0.0.1 or ::1 or ::1/128 or similar
	# todo

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

	return {'id':id2}, 200



# start server
if __name__ == '__main__':
	deleteOldPdfs()
	startCleaningJob()
	app.run(host='0.0.0.0', port=80)
