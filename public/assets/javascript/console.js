/* global $,Terminal */
$(() => {
  const term = new Terminal({
    theme: {
      background: '#1D445A',
    },
    cols: 100,
  });

  term.open(document.getElementById('terminal'));

  window.onresize = () => {
    const cols = (document.body.clientWidth * 0.72) / 7;
    const rows = (document.body.clientHeight * 0.4) / 11;
    term.resize(Math.round(cols), Math.round(rows));
  };

  window.electron.stderr(arg => {
    term.write(arg.replace(/\n/g, '\n\r'));
  });

  window.electron.cmdError(() => {
    $('#errorModal').modal('show');
  });
});
