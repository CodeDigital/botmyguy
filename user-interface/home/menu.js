var activeElement = document.getElementById('active');
activeElement.style.backgroundColor = '#190019';

function menuHover(x) {
  x.style.backgroundColor = '#100010';
  x.style.borderColor = '#180018';
}

function menuNormal(x) {
  x.style.borderColor = '#180018';
  if(x == document.getElementById('active')){
    x.style.backgroundColor = '#190019';
  }else{
    x.style.backgroundColor = '#210021';
  }
}
