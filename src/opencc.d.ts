declare module 'opencc-js' {
    type ConverterFunc = (text: string) => string

    interface ConverterConfig {
        from: string
        to: string
    }

    function Converter(config: ConverterConfig): ConverterFunc
}
