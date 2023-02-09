import {unsafeWindow} from "vite-plugin-monkey/dist/client";
import {proxy} from "ajax-hook";
import * as OpenCC from 'opencc-js';

(() => {
    const translator = OpenCC.Converter({from: "hk", to: "cn"});

    function absoluteUrl(relativeUrl: string): string {
      return relativeUrl.startsWith("//") ? "https:" + relativeUrl : relativeUrl
    }

    function formatable(text: string): string {
        return text.replace("\n", "\\n");
    }

    proxy({
        onResponse: (response, handler) => {
            const url = new URL(absoluteUrl(response.config.url));

            if (/bfs\/subtitle\/[a-z0-9]+\.json/.test(url.pathname)) {
                const subtitleList: SubtitleList = JSON.parse(response.response as string);

                // transform
                subtitleList.body.forEach((value) => {
                    const original = value.content;
                    const result = translator(original.replace(/ -/, "\n-"));

                    console.log(
                        `%c[SubtitleTweaks] ${formatable(original)} => ${formatable(result)}`,
                        `color: #5bc6f4;`
                    );

                    value.content = result;
                });

                response.response = JSON.stringify(subtitleList);
            }

            handler.next(response);
        },
    }, unsafeWindow);
})();
