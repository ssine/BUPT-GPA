// ==UserScript==
// @name         BUPT GPA
// @namespace    https://ssine.cc/
// @version      3.0
// @description  Calculate GPA in URP system
// @author       Liu Siyao
// @include      *://jwxt.bupt.edu.cn/jwLoginAction.do
// @include      *://jwxt.bupt.edu.cn/caslogin.jsp
// @include      *://vpn.bupt.edu.cn/http/jwxt.bupt.edu.cn/jwLoginAction.do
// @include      *://vpn.bupt.edu.cn/https/jwxt.bupt.edu.cn/jwLoginAction.do
// @include      *://jwgl.bupt.edu.cn/jsxsd/framework/xsMain.jsp
// @include      *://vpn.bupt.edu.cn/http/jwgl.bupt.edu.cn/jsxsd/framework/xsMain.jsp
// @include      *://vpn.bupt.edu.cn/https/jwgl.bupt.edu.cn/jsxsd/framework/xsMain.jsp
// @grant        none
// @require      https://cdn.bootcss.com/jquery/3.3.1/jquery.min.js
// @require      https://cdn.jsdelivr.net/npm/vue
// ==/UserScript==

(function () {
  'use strict';

  const is_old_system = /jwxt/.test(window.location.href);

  function run() {

    let promises = [];
    if (is_old_system) {
      promises = promises.concat([
        $.get('/gradeLnAllAction.do?type=ln&oper=qbinfo'),
        $.get('/gradeLnAllAction.do?type=ln&oper=lnFajhKcCjInfo&lnxndm=*')
      ]);
    } else {
      promises = promises.concat([
        $.post('/jsxsd/kscj/cjcx_list', {
          kksj: "",
          kcxz: "",
          kcmc: "",
          xsfs: "all"
        })
      ]);
    }

    Promise.all(promises).then((data) => {
      let algoNames = ['北邮官方', '标准4.0', '改进4.0', '北大4.0', '加拿大4.3', '中科大4.3', '上海交大4.3'];
      let algoArea = [
        [59, 60, 60.5, 61, 61.5, 62, 62.5, 63, 63.5, 64, 64.5, 65, 65.5, 66, 66.5, 67, 67.5, 68, 68.5, 69, 69.5, 70, 70.5, 71, 71.5, 72, 72.5, 73, 73.5, 74, 74.5, 75, 75.5, 76, 76.5, 77, 77.5, 78, 78.5, 79, 79.5, 80, 80.5, 81, 81.5, 82, 82.5, 83, 83.5, 84, 84.5, 85, 85.5, 86, 86.5, 87, 87.5, 88, 88.5, 89, 89.5, 90, 90.5, 91, 91.5, 92, 92.5, 93, 93.5, 94, 94.5, 95, 95.5, 96, 96.5, 97, 97.5, 98, 98.5, 99, 99.5, 100],
        [59, 69, 79, 89, 100],
        [59, 69, 84, 100],
        [59, 63, 67, 71, 74, 77, 81, 84, 89, 100],
        [59, 64, 69, 74, 79, 84, 89, 100],
        [59, 60, 63, 64, 67, 71, 74, 77, 81, 84, 89, 94, 100],
        [59, 61, 64, 66, 69, 74, 79, 84, 89, 94, 100]
      ];
      let algoGp = [
        [0, 1.00, 1.07, 1.15, 1.22, 1.29, 1.36, 1.43, 1.50, 1.57, 1.64, 1.70, 1.77, 1.83, 1.90, 1.96, 2.02, 2.08, 2.14, 2.20, 2.26, 2.31, 2.37, 2.42, 2.48, 2.53, 2.58, 2.63, 2.68, 2.73, 2.78, 2.83, 2.87, 2.92, 2.96, 3.01, 3.05, 3.09, 3.13, 3.17, 3.21, 3.25, 3.29, 3.32, 3.36, 3.39, 3.43, 3.46, 3.49, 3.52, 3.55, 3.58, 3.61, 3.63, 3.66, 3.68, 3.71, 3.73, 3.75, 3.77, 3.79, 3.81, 3.83, 3.85, 3.86, 3.88, 3.89, 3.91, 3.92, 3.93, 3.94, 3.95, 3.96, 3.97, 3.98, 3.98, 3.99, 3.99, 4.00, 4.00, 4.00, 4.00],
        [0, 1, 2, 3, 4],
        [0, 2, 3, 4],
        [0, 1, 1.5, 2, 2.3, 2.7, 3, 3.3, 3.7, 4],
        [0, 2.3, 2.7, 3, 3.3, 3.7, 4, 4.3],
        [0, 1, 1.3, 1.5, 1.7, 2, 2.3, 2.7, 3, 3.3, 3.7, 4, 4.3],
        [0, 1, 1.7, 2, 2.3, 2.7, 3, 3.3, 3.7, 4, 4.3]
      ];

      function getGP(score, i) {
        let area = algoArea[i];
        let gp = algoGp[i];
        for (let idx in area) {
          if (score <= area[idx])
            return gp[idx];
        }
        return score;
      };


      class course {
        constructor(no, name, semester, type, credit, grade) {
          this.no = no;
          this.name = name;
          this.semester = semester;
          this.type = type;
          this.credit = credit;
          this.grade = grade;
        }
      }

      let calc_mat = [];
      let course_lst = [];
      let course_lst_csv = 'Name,Credit,Grade\n'
      let semesters = [];
      let course_types = ['必修', '选修', '任选'];
      let semester_name = '';

      function fakeClick(obj) {
        let ev = document.createEvent("MouseEvents");
        ev.initMouseEvent("click", true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        obj.dispatchEvent(ev);
      }

      function exportRaw() {
        let urlObject = window.URL || window.webkitURL || window;
        let export_blob = new Blob([course_lst_csv]);
        let save_link = document.createElementNS("http://www.w3.org/1999/xhtml", "a")
        save_link.href = urlObject.createObjectURL(export_blob);
        save_link.download = "my_grade.csv";
        fakeClick(save_link);
      }

      function showResult() {
        // show courses in course_lst to div

        let sum = 0,
          total_credit = 0;
        let gpLst = [0, 0, 0, 0, 0, 0];

        let used_couse_num = 0;
        for (let idx = 0; idx < course_lst.length; idx++) {
          let course = course_lst[idx];
          if (!calc_mat[semesters.indexOf(course.semester)][course_types.indexOf(course.type)])
            continue;
          total_credit += course.credit;
          sum += course.credit * course.grade;
          for (let j in gpLst) {
            gpLst[j] += course.credit * getGP(course.grade, j);
          }
          used_couse_num ++;
        };

        $('#gpa-res').empty();
        $('#gpa-res').append($('<table>\
          <tr><th>算法</th><th>GPA</th></tr>\
          </table>'));

        for (let idx in gpLst) {
          let newTr = "<tr><td>" + algoNames[idx] + "</td><td>" + (gpLst[idx] / total_credit).toFixed(2) + "</td></tr>";
          $('#gpa-res table').append($(newTr));
        }
        let contentStr = "特殊加权学分绩:   " + (sum / total_credit).toFixed(2);
        contentStr += "<br>已修读学分:   " + total_credit.toString();
        contentStr += "<br>计算的课程数:   " + used_couse_num;
        contentStr += "<br>总课程数:   " + course_lst.length;
        $('#gpa-res').append($('<p>' + contentStr + '</p>'));
      }

      let parser = new DOMParser();
      if (is_old_system) {

        // prepare fallback grades when normal grade is one of 优良中差
        let course_no_to_grade = {};

        parser.parseFromString(data[1], "text/html").querySelectorAll('.odd').forEach((row) => {
          if (row.childNodes.length == 11) {
            let course_no = row.childNodes[1].innerText.trim();
            let grade = parseFloat(row.childNodes[7].innerText.trim());
            if (course_no && grade)
              course_no_to_grade[course_no] = grade;
          }
        });

        // parse grades
        let body_lst = parser.parseFromString(data[0], "text/html").getElementsByTagName('body')[0].childNodes;

        for (let i = 0; i < body_lst.length; i++) {
          if (body_lst[i].tagName == 'A') {
            semester_name = body_lst[i].name;
            if (semesters.indexOf(semester_name) == -1) {
              semesters.push(semester_name);
            }
          } else if (body_lst[i].className == 'titleTop2') {
            let entry = $(body_lst[i]).find('.odd');
            for (let j = 0; j < entry.length; j++) {
              let lst = entry[j].getElementsByTagName('td');
              let grade_text = entry[j].getElementsByTagName('p')[0].innerText.trim();
              let grade = parseFloat(grade_text);
              if (grade_text in ['优', '良', '中', '差'])
                grade = course_no_to_grade[lst[0].innerText.trim()];
              if (isNaN(grade)) continue;
              let course_no = lst[0].innerText.trim();
              let course_name_zh = lst[2].innerText.trim();
              let course_name_en = lst[3].innerText.trim();
              let course_type = lst[5].innerText.trim();
              let course_credit = lst[4].innerText.trim();
              course_lst.push(new course(
                course_no,
                course_name_zh,
                semester_name,
                course_type,
                parseFloat(course_credit),
                grade
              ));
              course_lst_csv += (course_name_en + ',' + course_credit + ',' + grade + '\n');
            }
          }
        }

      } else {
        let named_grade = {
          '差': 65,
          '及格': 65,
          '合格': 65,
          '中': 75,
          '良': 85,
          '优': 95
        };
        // parse grades
        let body_lst = parser.parseFromString(data[0], "text/html").querySelector('#dataList tbody').childNodes;
        body_lst = Array.prototype.slice.call(body_lst, 0).filter((_, idx) => idx % 2 === 0).slice(1);
        body_lst = body_lst.map(it => it.cells);

        for (let item of body_lst) {
          if (item[6].innerText.trim() === '免修') continue;
          semester_name = item[1].innerText.trim();
          if (semesters.indexOf(semester_name) == -1) {
            semesters.push(semester_name);
          }
          let grade_text = item[5].innerText.trim();
          let grade = parseFloat(grade_text);
          if (grade_text in named_grade)
            grade = named_grade[grade_text];
          if (isNaN(grade)) continue;
          let course_no = item[2].innerText.trim();
          let course_name_zh = item[3].innerText.trim();
          let course_name_en = item[3].innerText.trim(); // not found yet...
          let course_type = item[13].innerText.trim();
          let course_credit = item[7].innerText.trim();
          course_lst.push(new course(
            course_no,
            course_name_zh,
            semester_name,
            course_type,
            parseFloat(course_credit),
            grade
          ));
          course_lst_csv += (course_name_en + ',' + course_credit + ',' + grade + '\n');
        }
      }


      for (let i = 0; i < semesters.length; i++)
        calc_mat.push([true, true, false]);

      // vue & ui stuff
      let gpa_div = $(`<div id="gpa">
      <div id="gpa-side">
      <div id="gpa-modify">
      <h2>课程属性:</h2>
      <table>
      <tr>
        <th>课程名</th>
        <th>类型</th>
        <th>成绩</th>
        <th>学分</th>
      </tr>
      <tr v-for="c in courses">
        <td>{{c.name}}</td>
        <td>
          <select v-model="c.type">
          <option>必修</option>
          <option>选修</option>
          <option>任选</option>
          </select>
        </td>
        <td>{{c.grade}}</td>
        <td>{{c.credit}}</td>
      </tr>
      </table></div>
      </div>
      
      
      <div id="gpa-main-frame">
      <div id="calc-app">
      <h2>要计算的课程:</h2>
      <table>
      <tr>
        <th>学期</th>
        <th>必修</th>
        <th>选修</th>
        <th>任选</th>
      </tr>
      <tr v-for="(r, idx) in mat">
        <td>{{ semesters[idx] }}</td>
        <td><input type="checkbox" id="checkbox" v-model="r[0]"></td>
        <td><input type="checkbox" id="checkbox" v-model="r[1]"></td>
        <td><input type="checkbox" id="checkbox" v-model="r[2]"></td>
      </tr>
      </table></div>
      
      
      <h2>结果:</h2>
      <div id="gpa-res">
      </div>
      <div id="csv-download">
      </div>
      <hr>
      <p>程序完全基于前端，不会存储个人信息。</p>
      <p>使用过程中有问题请在<a target="_blank" href="https://github.com/ssine/BUPT-GPA">代码仓库</a>提 issue</p>
      <p>没问题也欢迎来点个 star ヽ(✿ﾟ▽ﾟ)ノ</p>
      <p>欢迎把<a target="_blank" href="https://greasyfork.org/zh-CN/scripts/369550-bupt-gpa">这个脚本</a>分享给你的朋友哦(*/ω＼*)</p>
      </div>
      </div>`);


      let sheet_css = $(`<style>
      #gpa {
        position: absolute;
        right: 70px;
        bottom: 20px;
        height: 80%;
        background-color: rgba(255,255,255,0.9);
        font-size: 16px;
        line-height: 23px;
      }
      #gpa table {
        border-collapse: separate;
        border-spacing: 15px 0;
      }
      #gpa-side {
        float: left;
        margin-right: 20px;
        height: 100%;
        overflow: auto;
      }
      #gpa-main-frame {
        float: left;
        height: 100%;
        overflow: auto;
      }
      #gpa-modify table tr td:first-child, #gpa-modify table tr th:first-child {
        width: 200px;
      }
      #calc-app {
      }
      #res-app {
        margin-top: 50px;
      }
      #gpa-btn {
        position: absolute;
        right: 20px;
        bottom: 20px;
        background-color: RGB(119,119,119);
        color: rgb(255,255,255);
        height: 50px;
        width: 50px;
        border-radius: 50px;
        font-family: sans-serif;
      }
      </style>`);

      let btn_download = $('<button id="download-btn">下载CSV成绩单</button>');
      btn_download.click(() => {
        exportRaw();
      });

      $('head').append(sheet_css);
      gpa_div.hide();
      $('html').append(gpa_div);

      let btn = $('<button id="gpa-btn">GPA</button>');
      btn.click(() => {
        let app = $('#gpa');
        if (app.css('display') == 'none')
          app.css('display', '');
        else
          app.css('display', 'none');
      });
      $('html').append(btn);
      $('#csv-download').append(btn_download);
      showResult();

      const gpa_modify = new Vue({
        el: '#gpa-modify',
        data: {
          courses: course_lst
        },
        watch: {
          courses: {
            handler(newValue, oldValue) {
              showResult();
            },
            deep: true
          }
        }
      });

      let calc_app = new Vue({
        el: '#calc-app',
        data: {
          mat: calc_mat,
          semesters: semesters
        },
        watch: {
          mat: showResult
        }
      });
    })
  }

  if (is_old_system) window.parent.frames[1].onload = run;
  else window.onload = run;

})();
