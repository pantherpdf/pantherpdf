import json
import time
import subprocess
import requests
import websocket  # pip3 install websocket-client
assert websocket.create_connection
import base64
import random
import socket
import contextlib
import errno
import tempfile
import os
import os.path

# https://medium.com/@lagenar/using-headless-chrome-via-the-websockets-interface-5f498fb67e0f
# https://chromedevtools.github.io/devtools-protocol/tot/Page/#method-printToPDF

# todo check if useful headers are used in similar project: https://github.com/danielwestendorf/breezy-pdf-lite


defaultPaperWidth = 210
defaultPaperHeight = 297



def start_browser_get_url(debugging_port):
	url_dbg = f'http://127.0.0.1:{debugging_port}/json'
	try:
		resp = requests.get(url_dbg, timeout=1.2)
	except (requests.exceptions.ConnectionError, TimeoutError, requests.exceptions.Timeout, requests.exceptions.ConnectTimeout, requests.exceptions.ReadTimeout) as ex:
		return False
	if resp.status_code != 200:
		return False
	try:
		resp2 = resp.json()
	except json.decoder.JSONDecodeError:
		return False
	if not isinstance(resp2, list) or len(resp2) == 0:
		return False
	return resp2[0]['webSocketDebuggerUrl']




request_id = 0
def run_command(conn, method, **kwargs):
	global request_id
	tStart = time.time()
	request_id += 1
	command = {'method': method, 'id': request_id, 'params': kwargs}
	conn.send(json.dumps(command))
	while True:
		# max exec time for command
		if time.time() - tStart > 30:
			raise ValueError('chrome method \''+method+'\' timed out')
		xx = conn.recv()
		msg = json.loads(xx)
		if msg.get('id') == request_id:
			return msg



def start_browser(browser_path, debugging_port=9222):
	# start chrome
	print(f'Starting Chrome on port {debugging_port}')
	tmpDir = tempfile.gettempdir() if os.name == 'nt' else '/tmp'
	args = ['--headless',
			#'--enable-experimental-extension-apis',
			#'--enable-devtools-experiments',
			f'--crash-dumps-dir={tmpDir}',    # -disk-cache-dir=/tmp --user-data-dir=/tmp --crash-dumps-dir=/tmp
			'--single-process',
			f'--remote-debugging-port={debugging_port}',

			# when running as root, add --no-sandbox otherwise the following error appears
			# [0623/183933.537728:ERROR:zygote_host_impl_linux.cc(90)] Running as root without --no-sandbox is not supported. See https://crbug.com/638180.
			'--no-sandbox' if os.geteuid() == 0 else '',
		]
	#time.sleep(5)
	#print('START')
	browser_proc = subprocess.Popen([browser_path] + args)
	#time.sleep(5)

	# get websocket url
	wait_seconds = 10.0
	sleep_step = 0.25
	ws_url = None
	while wait_seconds > 0 and not ws_url:
		okOrUrl = start_browser_get_url(debugging_port)
		if okOrUrl:
			ws_url = okOrUrl
		else:
			time.sleep(sleep_step)
			wait_seconds -= sleep_step
		
	if not ws_url:
		browser_proc.kill()
		raise ValueError('Cant connect to chrome')
	# connect to websocket
	try:
		ws = websocket.create_connection(ws_url, timeout=20)  # keep long timeout for loading page
	except Exception as ex:
		browser_proc.kill()
		raise ex
	#except websocket._exceptions.WebSocketTimeoutException:
		#raise ValueError('Cant connect to chrome websocket')
	# check that i have connected to the right chrome
	# verify pid process id
	# x = run_command(conn, 'SystemInfo.getProcessInfo')
	# todo this command is experimental so it doesnt work
	#if x['processId'] != browser_proc.pid:
	#	# close ws
	#	try:
	#		ws.close()
	#	except Exception:
	#		pass
	#	# kill browser 
	#	try:
	#		browser_proc.kill()
	#	except Exception:
	#		pass
	#	raise ValueError('Connected to wrong chrome')

	# verify no history
	# alternative to process id
	x = run_command(ws, 'Page.getNavigationHistory')
	# {'id': 1, 'result': {'currentIndex': -1, 'entries': []}}
	# {'id': 1, 'result': {'currentIndex': 0, 'entries': [{'id': 1, 'url': 'about:blank', 'userTypedURL': 'about:blank', 'title': '', 'transitionType': 'typed'}]}}
	ok = False
	if x['result']['currentIndex'] == -1 and len(x['result']['entries']) == 0:
		ok = True
	if x['result']['currentIndex'] == 0 and len(x['result']['entries']) == 1 and x['result']['entries'][0]['url'] == 'about:blank':
		ok = True
	if x['result']['currentIndex'] == 0 and len(x['result']['entries']) == 1 and x['result']['entries'][0]['url'] == '':
		ok = True
	if not ok:
		try:
			browser_proc.kill()
		except Exception:
			pass
		print('Navigation history:')
		print(x)
		raise ValueError('This browser has navigation history')

	return browser_proc, ws




def mmToInch(mm):
	return mm * 0.0393700787


def isPortAvailable(host, port):
	with contextlib.closing(socket.socket(socket.AF_INET, socket.SOCK_STREAM)) as sock:
		sock.settimeout(1)
		n = sock.connect_ex((host, port))
		if n == 0:
			# closed
			return False
		# refused
		if errno.errorcode[n] == 'ECONNREFUSED':
			return True
		# timeout
		#if errno.errorcode[n] == 'EAGAIN':
		#	return False
		return False


def convertHtmlToPdf(chrome_path, data, output_pth):
	# find free port
	port = 9000 + random.randrange(500)
	numTries = 0
	while True:
		if port >= 9999:
			raise ValueError('Cant find free port')
		fileName = 'kelgrand-html-pdf-' + str(port) + '.sock'
		mutexPth = tempfile.gettempdir() if os.name == 'nt' else '/tmp'
		mutexPth = os.path.join(mutexPth, fileName)
		try:
			mutexFile = open(mutexPth, 'x')  # mode x prevents race condition
		except FileExistsError:
			port += 1
			continue
		if not isPortAvailable('127.0.0.1', port):
			mutexFile.close()
			del mutexFile
			os.remove(mutexPth)
			port += 1
			continue
		numTries += 1
		try:
			browser, conn = start_browser(chrome_path, port)
			break
		except Exception as ex:
			print('Cant start_browser(): ',ex)
			if numTries > 5:
				raise ex
			else:
				continue

	# start and connect to chrome
	url = data['url']

	data['paperWidth'] = data['paperWidth'] if 'paperWidth' in data else defaultPaperWidth
	data['paperHeight'] = data['paperHeight'] if 'paperHeight' in data else defaultPaperHeight
	data['printBackground'] = data['printBackground'] if 'printBackground' in data else False
	data['marginTop'] = data['marginTop'] if 'marginTop' in data else min(20, data['paperHeight']*0.15)
	data['marginBottom'] = data['marginBottom'] if 'marginBottom' in data else min(20, data['paperHeight']*0.15)
	data['marginLeft'] = data['marginLeft'] if 'marginLeft' in data else min(20, data['paperWidth']*0.15)
	data['marginRight'] = data['marginRight'] if 'marginRight' in data else min(20, data['paperWidth']*0.15)

	if 'header' not in data:
		data['header'] = '<div></div>'
	if 'footer' not in data:
		data['footer'] = '''
<p style="font-size:2mm; font-family: Arial, Helvetica, sans-serif; text-align:center; width:100%;">
	<span class="pageNumber"></span> / <span class="totalPages"></span>
</p>
'''

	#print(data)

	try:
		run_command(conn, 'Network.setCacheDisabled', cacheDisabled=True)  # just to be sure. It seems that it doesnt cache either way.
		run_command(conn, 'Page.navigate', url=url)
		time.sleep(6) # let it load

		# https://chromedevtools.github.io/devtools-protocol/tot/Page/#method-printToPDF
		resp = run_command(conn, 'Page.printToPDF', paperWidth=mmToInch(data['paperWidth']), paperHeight=mmToInch(data['paperHeight']), printBackground=data['printBackground'], displayHeaderFooter=True, headerTemplate=data['header'], footerTemplate=data['footer'], marginTop=mmToInch(data['marginTop']), marginBottom=mmToInch(data['marginBottom']), marginLeft=mmToInch(data['marginLeft']), marginRight=mmToInch(data['marginRight']))  # , scale=1, preferCSSPageSize=True
		if 'error' not in resp:
			data = base64.b64decode(resp['result']['data'])
			with open(output_pth, 'wb') as file:
				file.write(data)

		# close browser
		try:
			run_command(conn, 'Browser.close')
			time.sleep(0.7)
		except Exception:
			pass

		if 'error' in resp:
			msg = resp['error'] if isinstance(resp['error'], str) else json.dumps(resp['error'])
			raise ValueError(msg)

		# check size
		if not os.path.isfile(output_pth) or os.path.getsize(output_pth) == 0:
			raise ValueError('Target PDF file is empty or doesnt exist')

		print('chrome pdf print ok')

	finally:
		# close connection
		try:
			conn.close()
		except Exception:
			pass
		# kill browser 
		try:
			browser.kill()
		except Exception:
			pass
		# delete file mutex
		mutexFile.close()
		del mutexFile
		os.remove(mutexPth)



def testChrome(pth):
	# check that path is specified
	assert isinstance(pth, str)
	assert len(pth) > 0
	# run and check exit code == 0
	process = subprocess.run([pth, '--version'], check=True, stdout=subprocess.PIPE)
	output = process.stdout.decode('utf-8').strip()
	assert len(output) > 0
	print(f'Found chromium version: {output}')
