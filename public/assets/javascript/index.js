/* global $ */
$(() => {
  $('#quit').on('click', () => {
    window.electron.systemClose({ message: 'exit' });
  });

  $('#maximize').on('click', () => {
    window.electron.systemMaximize({ message: 'apply' });
  });

  $('#minimize').on('click', () => {
    window.electron.systemMinimize({ message: 'apply' });
  });

  $('#signout').on('click', () => {
    console.log('signout');
    window.electron.logout();
  });

  $('a[target="_blank"]').click(event => {
    event.preventDefault();
    const url = $(event.currentTarget).attr('href');
    window.electron.externalLink(url);
  });
});
