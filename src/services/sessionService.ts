export const joinSession = async (sessionId: string) => {
    const res = await fetch(import.meta.env.VITE_BE_URL + `/sessions/join/${sessionId}`, {
        method: 'POST',
        credentials: 'include'
    })
    return res;
}

export const getSession = async (sessionId: string) => {
    const res = await fetch(`${import.meta.env.VITE_BE_URL}/sessions/single?session_id=${sessionId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
    })
    return res;
}

export const updateSession = async (sessionId: string, match: any, events: any) => {
    const res = await fetch(`${import.meta.env.VITE_BE_URL}/sessions/state`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include', // per cookie HttpOnly
        body: JSON.stringify({
            session_id: sessionId,
            match: match,
            events: events
        })
    })
    return res;
}

export const createNewSession = async (title: string) => {
    const res = await fetch(import.meta.env.VITE_BE_URL + '/sessions/create', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            title: title
        })
    })
    return res;
}

export const getAllSessions = async () => {
    const res = await fetch(`${import.meta.env.VITE_BE_URL}/sessions/all`, {
        method: 'GET',
        credentials: 'include'
    });
    return res;
}

export const getSessionDetails = async (sessionId: string) => {
    const res = await fetch(`${import.meta.env.VITE_BE_URL}/sessions/session?session_id=${sessionId}`, {
      credentials: 'include'
    });
    return res;
}

export const updateParticipantRole = async (sessionId: string, userId: string, newRole: string) => {
    const res = await fetch(`${import.meta.env.VITE_BE_URL}/sessions/${sessionId}/participants`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: newRole,
        partecipant_id: userId
       })
    });
    return res;

}
export const deleteParticipant = async (sessionId: string, userId: string) => {
    const res = await fetch(`${import.meta.env.VITE_BE_URL}/sessions/${sessionId}/participants/${userId}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        partecipant_id: userId
       })
    });
    return res;
}