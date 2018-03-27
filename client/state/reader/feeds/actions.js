/** @format */
/**
 * External dependencies
 */
import { isArray } from 'lodash';

/**
 * Internal dependencies
 */
import {
	READER_FEED_REQUEST,
	READER_FEED_REQUEST_SUCCESS,
	READER_FEED_REQUEST_FAILURE,
	READER_FEED_UPDATE,
} from 'state/action-types';

export function requestFeed( feedId ) {
	return {
		type: READER_FEED_REQUEST,
		payload: {
			ID: feedId,
		},
	};
}

export function receiveReaderFeedRequestSuccess( data ) {
	return {
		type: READER_FEED_REQUEST_SUCCESS,
		payload: data,
	};
}

export function receiveReaderFeedRequestFailure( action, error ) {
	return {
		type: READER_FEED_REQUEST_FAILURE,
		payload: action.payload,
		error,
	};
}

export function updateFeeds( feeds ) {
	if ( ! isArray( feeds ) ) {
		feeds = [ feeds ];
	}

	return {
		type: READER_FEED_UPDATE,
		payload: feeds,
	};
}
