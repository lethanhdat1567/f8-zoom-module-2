const init = {
    user: null,
    playlists: [],
};

export default function reducer(state = init, action, args) {
    switch (action) {
        // User
        case "SET_USER":
            return { ...state, user: args[0] };

        case "LOGOUT":
            return { ...state, user: null };

        // Playlist
        case "SET_PLAYLIST":
            return { ...state, playlists: args[0] };

        case "ADD_PLAYLIST":
            return {
                ...state,
                playlists: [args[0], ...state.playlists],
            };

        case "UPDATE_PLAYLIST": {
            const updatedPlaylist = state.playlists.map((playlist) => {
                if (playlist.id === args[0].id) {
                    return { ...playlist, ...args[0] };
                } else {
                    return playlist;
                }
            });
            return {
                ...state,
                playlists: updatedPlaylist,
            };
        }
        case "REMOVE-PLAYLIST-ITEM": {
            const updatedPlaylist = state.playlists.filter(
                (playlist) => playlist.id !== args[0]
            );
            return {
                ...state,
                playlists: updatedPlaylist,
            };
        }

        case "NAV_PLAYLIST": {
            const playlists = state.playlists.filter(
                (playlist) => playlist.type === args[0]
            );

            return {
                ...state,
                playlists: playlists,
            };
        }

        default:
            return state;
    }
}
