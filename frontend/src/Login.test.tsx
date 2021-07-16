/**
 * @jest-environment jsdom
 */

import React from 'react'
import { render, act, screen } from '@testing-library/react'
import Login from './Login'
import { MemoryRouter, Route } from 'react-router-dom'

describe('Rate Button', () => {
	it('loads and renders number of like and dislike', async () => {
		render(<MemoryRouter><Route path='/' component={Login} /></MemoryRouter>);

		// wait to load
		// await act(() => new Promise(resolve => setTimeout(resolve, 0)));

		const linkElement = screen.getByText(/Anonymous/i);
		expect(linkElement).toBeInTheDocument();
		expect(() => screen.getByText('Anonymous43432', { exact: false })).toThrow()
	})
})
