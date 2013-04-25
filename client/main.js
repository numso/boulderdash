window.require = require;

var game = require('./game');

bindHandlers();

function bindHandlers() {
  $('.play-btn').click(function (e) {
    $('.menus').hide();
    game.start();
    $('.game').show();
  });

  $('.help-btn').click(function (e) {
    $('.menu').hide();
    $('.help-menu').show();
  });

  $('.credits-btn').click(function (e) {
    $('.menu').hide();
    $('.credits-menu').show();
  });

  $('.back-btn').click(function (e) {
    $('.menu').hide();
    $('.main-menu').show();
  });

  $('.exit-btn').click(function (e) {
    exit();
  });

  function exit() {
    if (confirm("Are you sure you want to quit playing?")) {
      window.open('', '_self', '');
      window.close();
    }
  }
}
