document.addEventListener('DOMContentLoaded', function () {
  var elems = document.querySelectorAll('.sidenav');
  var instances = M.Sidenav.init(elems, {});
});

document.addEventListener('DOMContentLoaded', function () {
  var elems = document.querySelectorAll('.collapsible');
  var instances = M.Collapsible.init(elems, {});
});

const { shell } = require('electron')

function openGithub() {
  shell.openExternal('https://github.com/CodeDigital/botmyguy');
}

// Initialize collapsible (uncomment the lines below if you use the dropdown variation)
// var collapsibleElem = document.querySelector('.collapsible');
// var collapsibleInstance = M.Collapsible.init(collapsibleElem, options);

// Or with jQuery

// $(document).ready(function () {
//   $('.sidenav').sidenav();
// });


// var activeElement = document.getElementById('active');
// activeElement.style.backgroundColor = '#190019';

// function menuHover(x) {
//   x.style.backgroundColor = '#100010';
//   x.style.borderColor = '#180018';
// }

// function menuNormal(x) {
//   x.style.borderColor = '#180018';
//   if(x == document.getElementById('active')){
//     x.style.backgroundColor = '#190019';
//   }else{
//     x.style.backgroundColor = '#210021';
//   }
// }
