import React, { useEffect, useRef, useState } from 'react'
import App from '../Layout'
import { Link, RouteComponentProps } from 'react-router-dom'
import Lightbox from 'react-image-lightbox'
import 'react-image-lightbox/style.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBarcode, faEnvelope, faFileAlt, faFileExcel, faFont, faLanguage, faRocket, faSmileBeam, faSyncAlt, faTools, IconDefinition } from '@fortawesome/free-solid-svg-icons'
import logoJavascript from '../logo/javascript.svg'
import logoTypescript from '../logo/typescript.svg'
import logoReact from '../logo/react.svg'
import logoAngular from '../logo/angular.svg'
import logoVue from '../logo/vue.svg'
import img1 from '../images/unsplash-photo-1.jpeg'
import img2 from '../images/unsplash-photo-2.jpeg'
import img3 from '../images/unsplash-photo-3.jpeg'


interface SlideShowImage {
	src: string,
	title: string,
}

interface SlideShowProps {
	images: SlideShowImage[],
	timeout: number,
}

function SlideShow(props: SlideShowProps) {
	const [idx, setIdx] = useState<number>(0)
	const timer = useRef<number>(0)

	function cb(next: number) {
		setIdx(next)
		next = next+1 < props.images.length ? next+1 : 0
		timer.current = window.setTimeout(cb, props.timeout, next)
	}
	useEffect(() => {
		clearTimeout(timer.current)
		timer.current = window.setTimeout(cb, props.timeout, 0)
		return () => {
			clearTimeout(timer.current)
		}
		// eslint-disable-next-line
	}, [props.timeout])
	return <>
		<div>
			<img src={props.images[idx].src} alt='' style={{maxWidth:'250px'}} />
		</div>
		<div className='mt-3'>
			{props.images.map((x, idx2) => <button
				key={x.src}
				className={`btn ${idx===idx2 ? 'btn-outline-primary' : 'btn-link'} mx-1`}
				onClick={() => {
					clearTimeout(timer.current)
					setIdx(idx2)
					const next = idx2+1 < props.images.length ? idx2+1 : 0
					timer.current = window.setTimeout(cb, props.timeout, next)
				}}
			>
				{x.title}
			</button>)}
		</div>
	</>
}


export default function Home(props: RouteComponentProps) {

	const [showModalImages, setShowModalImages] = useState<boolean>(false)
	const [imgIndex, setImgIndex] = useState<number>(0)

	const useCase: [string, string, string][] = [
		['Generate invoice', 'Design beautiful looking invoices to your customers in seconds. Send invoices whenever you want from any device. With one click turn your quotation to invoice once the customer accepts it.', img1],
		['Financial services', 'In just a few steps create easy-to-read reports. Simple way to turn raw data into eye-catching and easy-to-understand charts and graphs.', img2],
		['Manufacturing', 'Perfect solution for developers of manufacturing apps. With one tool you can prepare work orders, print labels and export CSV for CNC machine.', img3],
		['Employee time atendance report', 'The best way to analyze time and attendance data and for visualizing them as detailed reports. Completely customisable.', ''],
		['Export to Excel, ERP, CSV', 'Data will be provided as CSV/Excel file format for effortless posting back to most accounting and ERP systems.', ''],
		['Generate Labels', 'Create custom printed labels, stickers, or cards quickly and simply. No trying to figure out margins and placement - it\'s so easy to do.', ''],
	]

	const featuresBig: [string, string, IconDefinition][] = [
		['Async functions', 'Report builder is completley asynchronous. That means you can easily query database on demand from within report editor.', faSyncAlt],
		['Integrate into App', 'Allow your customers to self-serive and extract data they need. Complete white-label solution that seamlesly integrates into you application.', faRocket],
		['Custom widgets', 'There is no one measure fits all. We can help you develop custom display widgets for your needs. See example for manufacturing.', faTools],
	]

	const features: [string, string, IconDefinition][] = [
		['Send via Email', 'Deliver automated PDFs to you users via email.', faEnvelope],
		['Qr, Barcode', 'Many advanced widgets are already integrated inside the app', faBarcode],
		['Transforms', 'Transform and sort data before designing a PDF. Use JS functions to customize data.', faTools],
		['Custom fonts', 'Design reports with your corporate fonts and colors.', faFont],
		['Subreports', 'Reuse reports inside other reports to save time.', faFileAlt],
		['Multilingual', 'Design one report with multiple languages. Select language when printing. Editor is also multilangual.', faLanguage],
		['Easy to use', 'And powerful to build complex reports. Many built-in widgets such as Condition, Counter, Repeat ...', faSmileBeam],
		['JSON, CSV, Excel', 'Use the same tools to design export files for ERP and other legacy systems.', faFileExcel],
	]

	const logosFrontend: [string, string][] = [
		['Javascript', logoJavascript],
		['Typescript', logoTypescript],
		['React', logoReact],
		['Angular', logoAngular],
		['Vue', logoVue],
	]

	const images = [
		img1,
		img2,
		img3,
	];

	const slideImages: SlideShowImage[] = [
		{src: img1, title: 'Designer'},
		{src: img2, title: 'PDF report'},
		{src: img3, title: 'CSV export'},
	]

	// preload images
	useEffect(() => {
		slideImages.map(img => new Image().src = img.src)
		// eslint-disable-next-line
	}, [])

	return <App {...props}>
		<main className='container'>

			{/* HERO */}
			<div className="p-5 mb-4 bg-light rounded-3 mt-5 mb-5">
				<div className="row">
					<div className='col-lg-6 mb-5'>
						<h1 className="display-4 fw-bold">
							Generate PDFs,<br />
							extract data from your SaaS app.
						</h1>
						<p className="col-md-8 fs-4 mt-4">
							Kelgrand Report designer will help you and your customers design and distribute PDF reports and extract and convert data you need.
						</p>
						<Link to='/pricing' className="btn btn-primary btn-lg" type="button">
							Start for free
						</Link>
					</div>
					<div className='col-lg-6 text-center'>
						<SlideShow
							images={slideImages}
							timeout={3000}
						/>
					</div>
				</div>
			</div>


			{/* Intro text */}
			<div className='my-5 h4 fst-italic text-center text-muted fw-light'>
				Save yourself <strong>time</strong> and empower your customers<br/>to <strong>self-serve</strong> and design reports that they need.
			</div>


			{/* Use case */}
			<h2 className='h1 mb-4'>
				Use case
			</h2>

			<div className='row'>
				{useCase.map(x => <div className='col-md-6' key={x[0]}>
					<h3 className='border-bottom pb-2 mt-4'>
						{x[0]}
					</h3>
					<div className='d-flex'>
						{x[2].length > 0 && <button
							className='btn'
							onClick={() => {
								setShowModalImages(true)
								setImgIndex(images.indexOf(x[2]))
							}}
						>
							<img src={x[2]} alt='' style={{maxWidth:'70px'}} className='d-block' />
							<small>Invoice</small>
						</button>}
						<div className='flex-fill ms-4'>
							{x[1]}
						</div>
					</div>
				</div>)}
			</div>


			{/* Lightbox when you open img */}
			{showModalImages && <Lightbox
				mainSrc={images[imgIndex]}
				nextSrc={images[(imgIndex + 1) % images.length]}
				prevSrc={images[(imgIndex + images.length - 1) % images.length]}
				onCloseRequest={() => { setShowModalImages(false) }}
				onMovePrevRequest={() => setImgIndex((imgIndex+images.length-1) % images.length)}
				onMoveNextRequest={() => setImgIndex((imgIndex+1) % images.length)}
			/>}
			<div style={{height: '50px'}} />


			{/* Features Big */}
			<h2 className='h1 border-bottom pb-2'>
				Features
			</h2>

			<div className="row g-4 py-5 row-cols-1 row-cols-lg-3">
				{featuresBig.map(x => <div
					key={x[0]}
					className="col d-flex align-items-start"
				>
					<div className="icon-square bg-light text-dark flex-shrink-0 me-3 p-2" style={{borderRadius:'0.75rem'}}>
						<FontAwesomeIcon icon={x[2]} className='text-muted m-1' size='2x' />
					</div>
					<div>
						<h2>
							{x[0]}
						</h2>
						<p>
							{x[1]}
						</p>
					</div>
				</div>)}
			</div>


			{/* Features Small */}
			<div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4 py-5">
				{features.map(f => <div
					className="col d-flex align-items-start"
					key={f[0]}
				>
					<FontAwesomeIcon icon={f[2]} className="text-muted flex-shrink-0 me-3 mt-1" size='2x' />
					<div>
						<h4 className="fw-bold mb-0">
							{f[0]}
						</h4>
						<p>
							{f[1]}
						</p>
					</div>
				</div>)}
			</div>


			{/* Integrations */}
			<h2 className='h1 border-bottom pb-2'>
				Integrations
			</h2>

			<div className='mt-3'>
				{logosFrontend.map(f => <img
					src={f[1]}
					alt=''
					key={f[0]}
					title={f[0]}
					style={{width: '3rem', height: '3rem', opacity: 0.5}}
					className='me-3'
				/>)}
			</div>
			<p>
				Generating reports is supported via REST api.
			</p>


			{/* Spacing */}
			<div className='mt-5' />
		
		</main>
	</App>
}
