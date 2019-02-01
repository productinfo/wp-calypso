/** @format */

/**
 * Internal dependencies
 */
import userFactory from 'lib/user';
import { makeLayout, redirectLoggedOut } from 'controller';
import { navigation, siteSelection, sites } from 'my-sites/controller';
import { loggedIn, loggedOut, upload, fetchThemeFilters } from './controller';
import { validateFilters, validateVertical } from './validate-filters';

export default function( router ) {
	const user = userFactory();
	const isLoggedIn = !! user.get();
	const siteId =
		'\\d+' + // numeric site id
		'|' + // or
		'[^\\\\/.]+\\.[^\\\\/]+'; // one-or-more non-slash-or-dot chars, then a dot, then one-or-more non-slashes

	const loggedOutRoutes = [
		'/themes/:tier(free|premium)?',
		'/themes/:tier(free|premium)?/filter/:filter',
		'/themes/:vertical?/:tier(free|premium)?',
		'/themes/:vertical?/:tier(free|premium)?/filter/:filter',
	];

	// logged-in routes have an optional '/:site_id?' suffix at the end
	const loggedInRoutes = loggedOutRoutes.map( route => `${ route }/:site_id(${ siteId })?` );

	// Upload routes are valid only when logged in. In logged-out sessions they redirect to login page.
	router( '/themes/upload', redirectLoggedOut, siteSelection, sites, makeLayout );
	router(
		'/themes/upload/:site_id',
		redirectLoggedOut,
		siteSelection,
		upload,
		navigation,
		makeLayout
	);

	if ( isLoggedIn ) {
		router(
			loggedInRoutes,
			fetchThemeFilters,
			validateVertical,
			validateFilters,
			siteSelection,
			loggedIn,
			navigation,
			makeLayout
		);
	} else {
		router(
			loggedOutRoutes,
			fetchThemeFilters,
			validateVertical,
			validateFilters,
			loggedOut,
			makeLayout
		);

		// If a logged-in route is hit in a logged-out session, it means it has a ':site_id' suffix.
		// Otherwise it would be captured and handled by an earlier logged-out handler.
		// Let's redirect these routes to the login page.
		router( loggedInRoutes, redirectLoggedOut );
	}
}
