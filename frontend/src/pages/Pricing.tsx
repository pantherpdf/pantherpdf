import App from '../Layout'
import { Link, RouteComponentProps } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck } from '@fortawesome/free-solid-svg-icons'

export default function Pricing(props: RouteComponentProps) {
	return <App {...props}>
		<main className='container' style={{maxWidth:'800px'}}>

			{/* Heading */}
			<div className="pricing-header p-3 pb-md-4 mx-auto text-center">
				<h1 className="display-4 fw-normal">
					Pricing
				</h1>
				<p className="fs-5 text-muted">
					Do you have any question about licensing or you need custom package? <Link to='/contact'>Contact us.</Link>
				</p>
			</div>


			{/* Table */}
			<div className="table-responsive">
				<table className="table text-center">

					<thead>
						<tr>
							<th style={{width: '32%'}}></th>
							<th style={{width: '17%'}}>Free</th>
							<th style={{width: '17%'}}>Basic</th>
							<th style={{width: '17%'}}>Pro</th>
							<th style={{width: '17%'}}>Enterprise</th>
						</tr>
					</thead>

					<tbody>
						<tr>
							<th scope="row" className="text-start">Drag-Drop editor</th>
							<td><FontAwesomeIcon icon={faCheck} /></td>
							<td><FontAwesomeIcon icon={faCheck} /></td>
							<td><FontAwesomeIcon icon={faCheck} /></td>
							<td><FontAwesomeIcon icon={faCheck} /></td>
						</tr>
						<tr>
							<th scope="row" className="text-start">Number of developers</th>
							<td>1</td>
							<td>1</td>
							<td>5</td>
							<td>unlimited</td>
						</tr>
						<tr>
							<th scope="row" className="text-start">PDF reports / month</th>
							<td>300</td>
							<td>300</td>
							<td>10'000</td>
							<td>unlimited</td>
						</tr>
						<tr>
							<th scope="row" className="text-start">PDF generation time limit</th>
							<td>3</td>
							<td>5</td>
							<td>15 sec</td>
							<td>unlimited</td>
						</tr>
						<tr>
							<th scope="row" className="text-start">App integration</th>
							<td></td>
							<td><FontAwesomeIcon icon={faCheck} /></td>
							<td><FontAwesomeIcon icon={faCheck} /></td>
							<td><FontAwesomeIcon icon={faCheck} /></td>
						</tr>
						<tr>
							<th scope="row" className="text-start">Advanced widgets</th>
							<td></td>
							<td></td>
							<td><FontAwesomeIcon icon={faCheck} /></td>
							<td><FontAwesomeIcon icon={faCheck} /></td>
						</tr>
						<tr>
							<th scope="row" className="text-start">Custom widgets</th>
							<td></td>
							<td></td>
							<td><FontAwesomeIcon icon={faCheck} /></td>
							<td><FontAwesomeIcon icon={faCheck} /></td>
						</tr>
					</tbody>

					<tbody>
						<tr>
							<th scope="row" className="text-start">Cloud hosting</th>
							<td><FontAwesomeIcon icon={faCheck} /></td>
							<td><FontAwesomeIcon icon={faCheck} /></td>
							<td><FontAwesomeIcon icon={faCheck} /></td>
							<td><FontAwesomeIcon icon={faCheck} /></td>
						</tr>
						<tr>
							<th scope="row" className="text-start">Self hosting</th>
							<td></td>
							<td></td>
							<td></td>
							<td><FontAwesomeIcon icon={faCheck} /></td>
						</tr>
						<tr>
							<th scope="row" className="text-start">Use after subscription expires</th>
							<td></td>
							<td></td>
							<td></td>
							<td><FontAwesomeIcon icon={faCheck} /></td>
						</tr>
						<tr>
							<th scope="row" className="text-start">Support</th>
							<td></td>
							<td><FontAwesomeIcon icon={faCheck} /></td>
							<td><FontAwesomeIcon icon={faCheck} /></td>
							<td><strong>Priority</strong></td>
						</tr>
					</tbody>

					<tbody>
						<tr>
							<td></td>
							<td>
								<Link to='/login' className="w-100 btn btn-lg btn-outline-primary">
									Sign up
								</Link>
							</td>
							<td>
								<Link to='/contact' className="w-100 btn btn-lg btn-primary">
									Contact us
								</Link>
							</td>
							<td>
								<Link to='/contact' className="w-100 btn btn-lg btn-primary">
									Contact us
								</Link>
							</td>
							<td>
								<Link to='/contact' className="w-100 btn btn-lg btn-primary">
									Contact us
								</Link>
							</td>
						</tr>
					</tbody>
				</table>
			</div>


			{/* Services */}
			{/*<div className="pricing-header p-3 pb-md-4 mx-auto text-center mt-5">
				<h1 className="display-4 fw-normal">
					Serives
				</h1>
				<p className="fs-5 text-muted">
					We can help with integration and with designing reports.
				</p>
			</div>*/}
			

			{/* Guarantees */}
			<h2 className="h1 mt-5">
				Guarantees
			</h2>
			
			<p>
				We offer 30 days money back guatantee in case you are not satesfied (applies only when no support was requested).
			</p>


			{/* Support */}
			<h2 className="h1 mt-5">
				Support
			</h2>

			<p>
				We can help you set up and integrate into your app.
				Email and phone support are available.
			</p>

			
			{/* Spacing */}
			<div style={{height: '30px'}} />

		</main>
	</App>
}
