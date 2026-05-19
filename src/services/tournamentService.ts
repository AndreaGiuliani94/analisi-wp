const BE_URL = import.meta.env.VITE_BE_URL;
export const createNewTournament = async (payload: any) => {
    try {
        const response = await fetch(`${BE_URL}/tournaments/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(payload),
        });
        if (!response.ok) {
            throw new Error('Failed to create tournament');
        }
        return await response.json();
    } catch (error) {
        console.error('Error creating tournament:', error);
        throw error;
    }
}

export const deleteTournament = async (tournamentId: string) => {
    try {
        const response = await fetch(`${BE_URL}/tournaments/${tournamentId}`, {
            method: 'DELETE',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) {
            throw new Error('Failed to delete tournament');
        }
        return await response.json();
    } catch (error) {
        console.error('Error deleting tournament:', error);
        throw error;
    }
}

export const getAllTournaments = async () => {
    try {
        const response = await fetch(`${BE_URL}/tournaments/all`, {
            method: 'GET',
            credentials: 'include',
        });
        if (!response.ok) {
            throw new Error('Failed to fetch tournaments');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching tournaments:', error);
        throw error;
    }
}

export const getTournamentById = async (tournamentId: string) => {
    try {
        const response = await fetch(`${BE_URL}/tournaments/${tournamentId}`, {
            method: 'GET',
            credentials: 'include',
        });
        if (!response.ok) {
            throw new Error('Failed to fetch tournament details');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching tournament details:', error);
        throw error;
    }
}

export const updateTournament = async (tournamentId: string, payload: any) => {
    try {
        const response = await fetch(`${BE_URL}/tournaments/${tournamentId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(payload),
        });
        if (!response.ok) {
            throw new Error('Failed to update tournament');
        }
        return await response.json();
    } catch (error) {
        console.error('Error updating tournament:', error);
        throw error;
    }
}

export const getOrganizationUsers = async (organizationId: string) => {
    try {
        const response = await fetch(`${BE_URL}/organizations/${organizationId}/users`, {
            method: 'GET',
            credentials: 'include',
        });
        if (!response.ok) {
            throw new Error('Failed to fetch organization users');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching organization users:', error);
        throw error;
    }
}

export const addParticipantToTournament = async (tournamentId: string, payload: { user_id: string; role: string }) => {
    try {
        const response = await fetch(`${BE_URL}/tournaments/${tournamentId}/participants`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(payload),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Failed to add participant to tournament');
        }
        return await response.json();
    } catch (error) {
        console.error('Error adding participant to tournament:', error);
        throw error;
    }
}