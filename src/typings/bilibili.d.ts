interface SubtitleItem {
    content: string
    from: number
    to: number
    location: number
}

interface SubtitleList {
    body: Array<SubtitleItem>
}

interface Result<T> {
    data: T
}

interface PlayInfo {
    subtitle?: SubtitleInfo
}

interface SubtitleInfo {
    subtitles?: Array<SubtitleMetadata>
}

interface SubtitleMetadata {
    id: number
    id_str: string
    lan: string
    lan_doc: string
    subtitle_url: string
}
