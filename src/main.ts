import {unsafeWindow} from "vite-plugin-monkey/dist/client";
import {proxy} from "ajax-hook";
import * as OpenCC from 'opencc-js';

(() => {
    const translator = OpenCC.Converter({from: "twp", to: "cn"});

    function absoluteUrl(relativeUrl: string, protocol?: string): string {
        if (!protocol) {
            protocol = "https:";
        }

        return relativeUrl.startsWith("//") ? protocol + relativeUrl : relativeUrl;
    }

    function relativeUrl(absoluteUrl: string): string {
        const u = new URL(absoluteUrl);
        return u.href.substring(u.protocol.length);
    }

    function formatable(text: string): string {
        return text.replace("\n", "\\n");
    }

    function log(msg: string) {
        console.log(`%c[SubtitleTweaks] ${msg}`, `color: #5bc6f4;`);
    }

    proxy({
        onRequest: (config, handler) => {
            const url = new URL(absoluteUrl(config.url));

            switch (true) {
                case url.hostname.endsWith("hdslb.com") && /bfs\/subtitle\/[a-z0-9]+\.json/.test(url.pathname): {
                    config.originUrl = url.toString();

                    config.transform = true;

                    if (url.searchParams.has("translate")) {
                        url.searchParams.delete("translate");

                        config.translate = true;
                    }

                    config.url = relativeUrl(url.toString());

                    break;
                }
                case url.hostname === "api.bilibili.com" && /x\/player\/v2/.test(url.pathname): {
                    config.inject = true;

                    break;
                }
            }

            handler.next(config);
        },
        onResponse: (response, handler) => {
            if (response.config.transform === true) {
                const subtitleList: SubtitleList = JSON.parse(response.response as string);

                log(`Transforming ${response.config.originUrl}`);

                subtitleList.body.forEach((value) => {
                    const original = value.content;

                    let result = original.replace(/\s[-—－]/, s => `\n${s.substring(1)}`);

                    if (response.config.translate === true) {
                        result = translator(result);
                    }

                    const formatTimestamp = (timestamp: number, base: number) => {
                        return (Math.trunc(timestamp / base) % (base * 60)).toString().padStart(2, "0");
                    };

                    const timestamp = `${formatTimestamp(value.from, 3600)}:${formatTimestamp(value.from, 60)}:${formatTimestamp(value.from, 1)}`;

                    log(`${timestamp}: ${formatable(original)} => ${formatable(result)}`);

                    value.content = result;
                });

                response.response = JSON.stringify(subtitleList);
            } else if (response.config.inject === true) {
                const r: Result<PlayInfo> = JSON.parse(response.response as string);

                const newSubtitles = r.data.subtitle?.subtitles?.flatMap((value, index) => {
                    if (value.lan === "zh-Hant") {
                        const translatedValue: SubtitleMetadata = JSON.parse(JSON.stringify(value));
                        translatedValue.lan = "zh-Hans";
                        translatedValue.lan_doc = "中文（简体） - 自动翻译";
                        translatedValue.id = index;
                        translatedValue.id_str = translatedValue.id.toString();

                        const newUrl = new URL(absoluteUrl(translatedValue.subtitle_url));
                        newUrl.searchParams.append("translate", "1");
                        translatedValue.subtitle_url = relativeUrl(newUrl.toString());

                        return [translatedValue, value];
                    }

                    return [value];
                });
                if (newSubtitles) {
                    r.data.subtitle!.subtitles = newSubtitles;

                    response.response = JSON.stringify(r);
                }
            }

            handler.next(response);
        },
    }, unsafeWindow);
})();
