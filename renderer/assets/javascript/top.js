/* global $ */

$(() => {
  $('#login').on('click', () => {
    window.electron.login();
  });

  $('#api_login').on('click', () => {
    const api_key = $('#api_key').val();
    window.electron.api_login(api_key);
  });

  window.electron.loginError(() => {
    $('#errorModal').modal('show');
  });
});
