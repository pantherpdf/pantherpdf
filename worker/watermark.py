from PyPDF2 import PdfFileWriter, PdfFileReader
import io
from reportlab.pdfgen import canvas
import reportlab.lib.pagesizes
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import os.path


currentDir = os.path.dirname(os.path.realpath(__file__))
font_file = os.path.join(currentDir, 'NotoSans-Regular.ttf')
assert os.path.isfile(font_file)
pdfmetrics.registerFont(TTFont('Noto Sans', font_file))



def makeWaterMark(txt, pageWidth, pageHeight):
	# check that page is big enough
	if pageWidth / mm < 150:
		return None
	if pageHeight / mm < 150:   # reportlab.lib.pagesizes.mm
		return None

	packet = io.BytesIO()
	c = canvas.Canvas(packet, pagesize=(pageWidth, pageHeight))  # in 1/72 of an inch
	c.setFont('Noto Sans', 6)
	c.setFillColorRGB(0.5, 0.5, 0.5)

	if pageHeight > pageWidth:
		# portrait
		c.saveState()
		c.rotate(90)
		c.drawString(20*mm, -15*mm, txt)
		c.restoreState()
	else:
		# landscape
		c.drawString(20*mm, pageHeight-10*mm, txt)
	
	c.save()
	packet.seek(0)
	return packet



def addWatermark(source, destination, text):
	assert os.path.isabs(source)
	assert os.path.isabs(destination)
	assert source != destination

	# read your existing PDF
	output = PdfFileWriter()

	with open(source, "rb") as existing_pdf_stream:
		existing_pdf = PdfFileReader(existing_pdf_stream)
		for i in range(existing_pdf.getNumPages()):
			page = existing_pdf.getPage(i)
			bx = page.mediaBox # artBox, bleedBox, cropBox, mediaBox, trimBox
			w = float(bx[2] - bx[0])
			h = float(bx[3] - bx[1])
			watemark = makeWaterMark(text, w, h)
			if watemark:
				watemark = PdfFileReader(watemark)
				page_watemark = watemark.getPage(0)
				page.mergePage(page_watemark)
			output.addPage(page)

		outputStream = open(destination, "wb")
		output.write(outputStream)
		outputStream.close()
