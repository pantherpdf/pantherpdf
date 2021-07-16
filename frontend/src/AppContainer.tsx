import React, { useState, useContext, useEffect } from 'react'
import './global.scss'
import './App.css'
import Login from './Login'
import { AppContext, getApp, IAppContextData, AppContextDefaultData } from './context'
import { BrowserRouter, Route, Redirect, RouteProps } from 'react-router-dom'
import App from './App'
import Dashboard from './Dashboard'
import Keys from './Keys'
import Settings from './Settings'


function PrivateRoute (props1: RouteProps) {
	const Component = props1.component
	const props2 = {...props1}
	delete props2.component
	const app = useContext(AppContext)
	if (!Component)
		return null
	return <Route
		{...props2}
		render={(props3: any) => {
			return app.user ? <App {...props3}><Component {...props3} /></App> : <Redirect to='/login' />
		}}
	/>
}

function AppContainer() {
	const [data, setData] = useState<IAppContextData>(AppContextDefaultData())
	const app = getApp(data, setData);
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const sid = window.localStorage.getItem('sid')
		if (!app.user && sid && sid.length > 0) {
			(async function() {
				await app.setSid(sid)
				setLoading(false)
			})()
		}
		else {
			setLoading(false)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	if (loading) {
		return <div>Loading ...</div>
	}

	return <AppContext.Provider value={app}>
		<BrowserRouter>
			<Route exact path='/'><Redirect to='/dashboard' /></Route>
			<Route exact path='/login' component={Login} />
			<PrivateRoute exact path='/dashboard' component={Dashboard} />
			<PrivateRoute exact path='/keys' component={Keys} />
			<PrivateRoute exact path='/settings' component={Settings} />
		</BrowserRouter>
	</AppContext.Provider>
}

export default AppContainer;
