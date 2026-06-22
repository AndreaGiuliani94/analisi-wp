const BE_URL = import.meta.env.VITE_BE_URL;

export const getVideoLink = async (fileName: string) => {
    const res = await fetch(BE_URL + '/video/link' + `?file_name=${fileName}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
    })
    return res;
}

export const getVideoInfo = async (videoId: string) => {
    const res = await fetch(BE_URL + '/video/info' + `?video_id=${videoId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
    })
    return res;
}

export const getVideoList = async () => {
    const res = await fetch(BE_URL + '/video/list', {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
    })
    return res;
}

export const getClipsReadyToDownload = async (videoId: string) => {
    const res = await fetch(BE_URL + '/video/clips/processed' + `?video_id=${videoId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
    })
    return res;
}

export const cleanBucket = async (videoId: string) => {
    const res = await fetch(BE_URL + '/video/clean-bucket' + `?video_id=${videoId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
    })
    return res;
}

export const exportClips = async (videoId: string, clips: any[]) => {
    const res = await fetch(BE_URL + '/video/clips', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ video_id: videoId, clips })
    })
    return res;
}

export const getDownloadUrl = async (key: string) => {
    const res = await fetch(BE_URL + '/video/clip/download-url' + `?key=${key}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
    })
    return res;
}

export const exportZip = async (links: string[]) => {
    const res = await fetch(BE_URL + '/video/export-zip', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ links })
    })
    return res;
}