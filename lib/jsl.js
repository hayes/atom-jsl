var jsl = require('jsl/rules')

module.exports.activate = activate

function activate() {
  atom.workspaceView.eachEditorView(watch)
}

function watch(view) {
  var editor = view.getEditor()

  lint(view, editor)
  editor.buffer.on('saved', lint.bind(null, view, editor))
  view.on('editor:display-updated', render_errors.bind(null, view, editor))
}

function lint(view, editor) {
  var stream = jsl()

  clear_errors(view);
  editor.jsl_errors = []

  stream.on('data', add_error)
  stream.write(editor.buffer.cachedText)
  stream.end()

  function add_error(error) {
    editor.jsl_errors.push(error)
    render_errors(view, editor)
  }
}

function clear_errors(view) {
  view.gutter.removeClassFromAllLines('jsl-error')
  view.gutter.removeClassFromAllLines('jsl-warning')
}

function render_errors(view, editor) {
  var errors = editor.jsl_errors

  clear_errors(view)

  for(var i = 0, len = errors.length; i < len; ++i) {
    view.gutter.addClassToLine(errors[i].line - 1, 'jsl-' + errors[i].type)
    view.find('.gutter .line-number-' + (errors[i].line - 1))
      .addClass('jsl-' + errors[i].type)
      .attr('data-error', errors[i].message)
  }
}
