// ==UserScript==
// @name         BUPT GPA
// @namespace    https://ssine.cc/
// @version      1.1
// @description  Calculate GPA in URP system
// @author       Liu Siyao
// @match        http://jwxt.bupt.edu.cn/jwLoginAction.do
// @grant        none
// @require      https://cdn.bootcss.com/jquery/3.3.1/jquery.min.js
// @license      MIT
// ==/UserScript==

(function() {
    'use strict';
    window.parent.frames[1].onload = ()=>{
        $.get('http://jwxt.bupt.edu.cn/gradeLnAllAction.do?type=ln&oper=sxinfo&lnsxdm=001').then(
            (res)=>{

                var algoNames = ['标准4.0', '改进4.0', '北大4.0', '加拿大4.3', '中科大4.3', '上海交大4.3'];
                var algoArea = [
                    [59, 69, 79, 89, 100],
                    [59, 69, 84, 100],
                    [59, 63, 67, 71, 74, 77, 81, 84, 89, 100],
                    [59, 64, 69, 74, 79, 84, 89, 100],
                    [59, 60, 63, 64, 67, 71, 74, 77, 81, 84, 89, 94, 100],
                    [59, 61, 64, 66, 69, 74, 79, 84, 89, 94, 100]
                ];
                var algoGp = [
                    [0, 1, 2, 3, 4],
                    [0, 2, 3, 4],
                    [0, 1, 1.5, 2, 2.3, 2.7, 3, 3.3, 3.7, 4],
                    [0, 2.3, 2.7, 3, 3.3, 3.7, 4, 4.3],
                    [0, 1, 1.3, 1.5, 1.7, 2, 2.3, 2.7, 3, 3.3, 3.7, 4, 4.3],
                    [0, 1, 1.7, 2, 2.3, 2.7, 3, 3.3, 3.7, 4, 4.3]
                ];
                function getGP(score, i) {
                    var area = algoArea[i];
                    var gp = algoGp[i];
                    for (var idx in area) {
                        if(score <= area[idx])
                            return gp[idx];
                    }
                    return score;
                };

                var parser = new DOMParser();
                var doc = parser.parseFromString(res, "text/html");

                var lst = doc.getElementsByName('qb_001')[0].getElementsByClassName('odd');

                var sum = 0, total = 0;
                var gpLst = [0, 0, 0, 0, 0, 0];

                for (var idx = 0; idx < lst.length; idx++) {
                    var items = lst[idx].getElementsByTagName('td');
                    if (items[6].innerText.search('免修') != -1)
                        continue;
                    if (items[6].innerText.search('通过') != -1)
                        continue;
                    total += parseFloat(items[4].innerText);
                    sum += parseFloat(items[4].innerText) * parseFloat(items[6].innerText);
                    for (var j in gpLst) {
                        gpLst[j] += parseFloat(items[4].innerText) * getGP(parseFloat(items[6].innerText), j);
                    }
                };

                var frame = window.parent.frames[1].document.getElementsByName('mainFrame')[0];
                frame = frame.contentDocument || frame.contentWindow.document;
                var injectEntry = $(frame).find('.hometopbg1:first');
                var contentStr = "特殊加权学分绩:   " + (sum / total).toFixed(2);
                contentStr += "\\n已修读必修学分:   " + total.toString();
                for (var idx in gpLst) {
                    contentStr += "\\nGPA(" + algoNames[idx] + "):   " + (gpLst[idx]/total).toFixed(2);
                }
                var newtr = $('<tr><td height="25"><a href="javascript:alert(\'' + contentStr + '\');">查看GPA(必修)</a></td></tr>');
                injectEntry.append(newtr);


                // 算上选修TAT

                var lst = doc.getElementsByClassName('odd');

                var sum = 0, total = 0;
                var gpLst = [0, 0, 0, 0, 0, 0];

                for (var idx = 0; idx < lst.length; idx++) {
                    var items = lst[idx].getElementsByTagName('td');
                    if (items[6].innerText.search('免修') != -1)
                        continue;
                    if (items[6].innerText.search('通过') != -1)
                        continue;
                    total += parseFloat(items[4].innerText);
                    sum += parseFloat(items[4].innerText) * parseFloat(items[6].innerText);
                    for (var j in gpLst) {
                        gpLst[j] += parseFloat(items[4].innerText) * getGP(parseFloat(items[6].innerText), j);
                    }
                };

                var contentStr = "特殊加权学分绩:   " + (sum / total).toFixed(2);
                contentStr += "\\n已修读总学分:   " + total.toString();
                for (var idx in gpLst) {
                    contentStr += "\\nGPA(" + algoNames[idx] + "):   " + (gpLst[idx]/total).toFixed(2);
                }
                var newtr = $('<tr><td height="25"><a href="javascript:alert(\'' + contentStr + '\');">查看GPA(全部)</a></td></tr>');
                injectEntry.append(newtr);
            }
        )
    }
})();
