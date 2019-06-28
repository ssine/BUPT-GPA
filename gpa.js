// ==UserScript==
// @name         BUPT GPA
// @namespace    https://ssine.cc/
// @version      2.2
// @description  Calculate GPA in URP system
// @author       Liu Siyao
// @include      *://jwxt.bupt.edu.cn/jwLoginAction.do
// @include      *://jwxt.bupt.edu.cn/caslogin.jsp
// @include      *://vpn.bupt.edu.cn/http/jwxt.bupt.edu.cn/jwLoginAction.do
// @grant        none
// @require      https://cdn.bootcss.com/jquery/3.3.1/jquery.min.js
// @require      https://cdn.jsdelivr.net/npm/vue
// ==/UserScript==

(function() {
'use strict';
window.parent.frames[1].onload = ()=>{

let p1 = $.get('/gradeLnAllAction.do?type=ln&oper=qbinfo');
let p2 = $.get('/gradeLnAllAction.do?type=ln&oper=lnFajhKcCjInfo&lnxndm=*');

Promise.all([p1, p2]).then((data) => {

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
      if(score <= area[idx])
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
  let semesters = [];
  let course_types = ['必修', '选修', '任选'];
  let semester_name = '';

  function showResult() {
    // show courses in course_lst to div

    let sum = 0, total_credit = 0;
    let gpLst = [0, 0, 0, 0, 0, 0];

    for (let idx = 0; idx < course_lst.length; idx++) {
      let course = course_lst[idx];
      if (!calc_mat[semesters.indexOf(course.semester)][course_types.indexOf(course.type)])
        continue;
      total_credit += course.credit;
      sum += course.credit * course.grade;
      for (let j in gpLst) {
        gpLst[j] += course.credit * getGP(course.grade, j);
      }
    };


    $('#gpa-res').empty();
    $('#gpa-res').append($('<table>\
      <tr><th>算法</th><th>GPA</th></tr>\
      </table>'));

    for (let idx in gpLst) {
      let newTr = "<tr><td>" + algoNames[idx] + "</td><td>" + (gpLst[idx]/total_credit).toFixed(2) + "</td></tr>";
      $('#gpa-res table').append($(newTr));
    }
    let contentStr = "特殊加权学分绩:   " + (sum / total_credit).toFixed(2);
    contentStr += "<br>已修读学分:   " + total_credit.toString();
    $('#gpa-res').append($('<p>' + contentStr + '</p>'));
  }

  let parser = new DOMParser();

  // prepare fallback grades when normal grade is one of 优良中差
  let course_no_to_grade = {};

  parser.parseFromString(data[1], "text/html").querySelectorAll('.odd').forEach((row) => {
    if(row.childNodes.length == 11) {
      let course_no = row.childNodes[1].innerText.trim();
      let grade = parseFloat(row.childNodes[7].innerText.trim());
      if (course_no && grade)
        course_no_to_grade[course_no] = grade;
    }
  });
  console.log(course_no_to_grade);

  // parse grades
  let body_lst = parser.parseFromString(data[0], "text/html").getElementsByTagName('body')[0].childNodes;

  for(let i = 0; i < body_lst.length; i++) {
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
        course_lst.push(new course(
          lst[0].innerText.trim(),
          lst[2].innerText.trim(),
          semester_name,
          lst[5].innerText.trim(),
          parseFloat(lst[4].innerText),
          grade
        ));
      }
    }
  }

  for (let i = 0; i < semesters.length; i++)
    calc_mat.push([true, true, false]);

  // vue & ui stuff
  let gpa_div = $('<div id="gpa">\
  <div id="gpa-side">\
  <div id="gpa-modify">\
  <h2>课程属性:</h2>\
  <table>\
  <tr>\
    <th>课程名</th>\
    <th>类型</th>\
    <th>成绩</th>\
    <th>学分</th>\
  </tr>\
  <tr v-for="c in courses">\
    <td>{{c.name}}</td>\
    <td>\
      <select v-model="c.type">\
      <option>必修</option>\
      <option>选修</option>\
      <option>任选</option>\
      </select>\
    </td>\
    <td>{{c.grade}}</td>\
    <td>{{c.credit}}</td>\
  </tr>\
  </table></div>\
  </div>\
  \
  \
  <div id="gpa-main-frame">\
  <div id="calc-app">\
  <h2>要计算的课程:</h2>\
  <table>\
  <tr>\
    <th>学期</th>\
    <th>必修</th>\
    <th>选修</th>\
    <th>任选</th>\
  </tr>\
  <tr v-for="(r, idx) in mat">\
    <td>{{ semesters[idx] }}</td>\
    <td><input type="checkbox" id="checkbox" v-model="r[0]"></td>\
    <td><input type="checkbox" id="checkbox" v-model="r[1]"></td>\
    <td><input type="checkbox" id="checkbox" v-model="r[2]"></td>\
  </tr>\
  </table></div>\
  \
  \
  <h2>结果:</h2>\
  <div id="gpa-res">\
  </div>\
  <hr>\
  <p>程序完全基于前端，不会存储个人信息。</p>\
  <p>觉得好用来<a target="_blank" href="https://github.com/ssine/BUPT-GPA">仓库</a>点个star好不好ヽ(✿ﾟ▽ﾟ)ノ</p>\
  <p>欢迎把<a target="_blank" href="https://greasyfork.org/zh-CN/scripts/369550-bupt-gpa">这个脚本</a>分享给你的朋友哦(*/ω＼*)</p>\
  </div>\
  </div>');


  let sheet_css = $('<style>\
  #gpa {\
    position: absolute;\
    right: 70px;\
    bottom: 20px;\
    height: 80%;\
    background-color: rgba(255,255,255,0.9);\
  }\
  #gpa-side {\
    float: left;\
    margin-right: 20px;\
    height: 100%;\
    overflow: auto;\
  }\
  #gpa-main-frame {\
    float: left;\
    height: 100%;\
    overflow: auto;\
  }\
  #gpa-modify table tr td:first-child, #gpa-modify table tr th:first-child {\
    width: 200px;\
  }\
  #calc-app {\
  }\
  #res-app {\
    margin-top: 50px;\
  }\
  #gpa-btn {\
    position: absolute;\
    right: 20px;\
    bottom: 20px;\
    background-color: RGB(119,119,119);\
    color: rgb(255,255,255);\
    height: 50px;\
    width: 50px;\
    border-radius: 50px;\
    font-family: sans-serif;\
  }\
  </style>');
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

  showResult();

  let gpa_modify = new Vue({
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

}})();
