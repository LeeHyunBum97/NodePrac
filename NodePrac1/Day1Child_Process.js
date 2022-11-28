// 다른 프로세스를 실행할 수 있는 모듈 불러오기
const exec = require("child_process").exec;

// 운영체제를 알아야 한다.
const os = require("os");
console.log(os.platform()); // win32
console.log(os.type()); // Windows_NT
console.log(os.type().toLowerCase().indexOf("windows")); // indexOf에 windows 있으면 양수 없으면 음수가 나온다 -> windows식별 가능

/* 문자열을 비교할 때는 일치하는 것을 찾는 것보다 해당 문자열을 포함하고 있는지 찾는 경우가 더 많으며 이런 경우 indexOf()를 사용하고
   indexOf(문자열)은 문자열이 포함된 경우에는 시작위치를 그렇지 않은 경우는 음수를 반환한다.
   ==> 문자열 비교시 대소문자 구분 여부를 늘 확인해라.
*/
let osPosition = os
    .type()
    .toLowerCase()
    .indexOf("windows");
if (osPosition >= 0) {
    console.log("윈도우입니다.")
} else {
    console.log("윈도우가 아닙니다.")
}

/* os마다 터미널 명령어가 다르기 때문에 터미널을 조작하거나 외부 프로세스를 사용할때 os를 식별하고 그에 맞는 명령어나 프로세스를 실행 */

// 프로세스 준비
let process = exec('notepad.exe'); // windows에서는 dir이 디렉터리의 목록을 확인하는 것이고 나머지는 ls

// 프로세스가 정상적으로 준비되면
process
    .stdout
    .on('data', function (data) {
        console.log(data.toString());

    });
// 수행되지 않으면
process
    .stderr
    .on('data', function (data) {
        console.log(data.toString());

    })