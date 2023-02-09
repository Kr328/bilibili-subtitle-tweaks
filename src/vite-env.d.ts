interface SubtitleItem {
    content: string
    from: number
    to: number
    location: number
}

interface SubtitleList {
    body: Array<SubtitleItem>
}

declare module 'opencc-js' {
    type ConverterFunc = (text: string) => string

    interface ConverterConfig {
        from: string
        to: string
    }

    function Converter(config: ConverterConfig): ConverterFunc
}
