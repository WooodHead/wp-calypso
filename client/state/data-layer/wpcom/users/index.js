/** @format */

/**
 * External dependencies
 */

import { flow, get, isUndefined, map, noop, omit, omitBy } from 'lodash';

/**
 * Internal dependencies
 */
import { USERS_REQUEST, USER_DELETE } from 'state/action-types';
import { dispatchRequest, getHeaders } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { receiveUser, receiveDeletedUser } from 'state/users/actions';

export const DEFAULT_PER_PAGE = 10;

/**
 * Normalize a WP REST API (v2) user ressource for consumption in Calypso which
 * uses legacy API (v1) names internally.
 *
 * @param {Object} user Raw user from the API
 * @returns {Object} the normalized user
 */
export const normalizeUser = user =>
	omitBy(
		{
			ID: user.id,
			display_name: user.name,
			username: user.slug,
		},
		isUndefined
	);

/**
 * Dispatches a request to fetch post revisions users
 *
 * @param {Function} dispatch Redux dispatcher
 * @param {Object} action Redux action
 */
export const fetchUsers = ( { dispatch }, action ) => {
	const { siteId, ids, page = 1, perPage = DEFAULT_PER_PAGE } = action;
	dispatch(
		http(
			{
				path: `/sites/${ siteId }/users`,
				method: 'GET',
				apiNamespace: 'wp/v2',
				query: {
					include: ids,
					page,
					per_page: perPage,
				},
			},
			action
		)
	);
};

/**
 * Dispatches returned users
 *
 * @param {Function} dispatch Redux dispatcher
 * @param {Object} action Redux action
 * @param {Array} users raw data from post revisions API
 */
export const receiveUsers = ( { dispatch }, action, users ) => {
	const { page = 1, perPage = DEFAULT_PER_PAGE } = action;
	const normalizedUsers = map( users, normalizeUser );

	if ( get( getHeaders( action ), 'X-WP-TotalPages', 0 ) > page ) {
		fetchUsers(
			{ dispatch },
			{
				...omit( action, 'meta' ),
				page: page + 1,
				perPage,
			}
		);
	}

	map( normalizedUsers, flow( receiveUser, dispatch ) );
};

const dispatchUsersRequest = dispatchRequest( fetchUsers, receiveUsers, noop );

export const deleteUser = ( { dispatch }, action ) => {
	const { siteId, userId, reassignUserId } = action;

	const query = {};

	if ( reassignUserId ) {
		query.reassign = reassignUserId;
	}

	dispatch(
		http(
			{
				path: `/sites/${ siteId }/users/${ userId }/delete`,
				method: 'POST',
				apiNamespace: '1.1',
				query,
			},
			action
		)
	);
};

export const receiveDeleteUser = ( { dispatch }, action ) => {
	const { userId } = action;

	dispatch( receiveDeletedUser( userId ) );
};

const dispatchDeleteUserRequest = dispatchRequest( deleteUser, receiveDeleteUser, noop );

export default {
	[ USERS_REQUEST ]: [ dispatchUsersRequest ],
	[ USER_DELETE ]: [ dispatchDeleteUserRequest ],
};
