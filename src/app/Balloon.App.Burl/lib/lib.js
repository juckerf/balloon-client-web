/**
 * balloon
 *
 * @copyright   Copryright (c) 2012-2018 gyselroth GmbH (https://gyselroth.com)
 * @license     GPL-3.0 https://opensource.org/licenses/GPL-3.0
 */

import $ from "jquery";
import i18next from 'i18next';
import balloonWindow from '../../../lib/widget-balloon-window.js';
import css from '../styles/style.scss';

var app = {
  id: 'Balloon.App.Burl',

  /**
  * File extension for Burl files
  */
  BURL_EXTENSION: 'burl',

  balloon: null,

  render: function() {
  },

  preInit: function(core) {
    this.balloon = core;
    this.balloon.addNew(app.BURL_EXTENSION, i18next.t('app.burl.tree.burl_file'), 'hyperlink', this.addBurl.bind(this));

    this.balloon.fileExtIconMap[app.BURL_EXTENSION] = 'gr-i-language';
    this.balloon.mimeFileExtMap['application/vnd.balloon.burl'] = app.BURL_EXTENSION;

    this.balloon.addPreviewHandler(this._handlePreview);
  },

  /**
   * Checks if "preview" for a given node can be handled by this app.
   * If it can handle it, return a handler to preview the file
   *
   * @param   string mime
   * @return  void|function
   */
  _handlePreview: function(node) {
    if (app.isBurlFile(node)) {
      return function(node) {
        app.handleBurl(node);
      }
    }
  },

  /**
   * Check if file is .burl
   *
   * @param   object node
   * @return  bool
   */
  isBurlFile: function(node) {
    return this.BURL_EXTENSION === this.balloon.getFileExtension(node);
  },


  addBurl: function() {
    var $d = $.Deferred();
    var $div = $('<div id="fs-burl-window"></div>');
    $('body').append($div);

    $div.html(
      '<div class="error-message"></div>'+
      '<div class="fs-window-form">'+
        '<label>'+i18next.t('new_node.name')+'</label><input name="name" type="text"/>'+
        '<label>'+i18next.t('app.burl.url')+'</label><input placeholder="http://www.example.org" name="url" type="text"/>'+
      '</div>'+
      '<div class="fs-window-secondary-actions">'+
        '<input class="fs-button-primary" name="add" value='+i18next.t('button.save')+' type="submit"/>'+
        '<input name="cancel" value='+i18next.t('button.cancel')+' type="submit"/>'+
      '</div>');

    var $k_display = $div.kendoBalloonWindow({
      resizable: false,
      title: i18next.t('app.burl.title'),
      modal: true,
      activate: function(){
        $div.find('input[name=name]').focus();
      },
      open: function(e) {
        var mayCreate = false;
        var nameValid = false;
        var urlValid = false;

        var $input_name = $div.find('input[name=name]');
        var $input_url = $div.find('input[name=url]');
        var $submit = $div.find('input[name=add]');

        $div.find('input').removeClass('error-input');
        $submit.attr('disabled', true);

        $input_name.off('keyup').on('keyup', function(e) {
          let name = $input_name.val();
          let url = $input_url.val();

          if(e.keyCode === 13) {
            if(mayCreate) $submit.click();
            return;
          }

          if(app.balloon.nodeExists(name+'.'+app.BURL_EXTENSION) || name === '') {
            $input_name.addClass('error-input');
            nameValid = false;
          } else {
            $input_name.removeClass('error-input');
            nameValid = true;
          }

          mayCreate = nameValid && urlValid;
          $submit.attr('disabled', !mayCreate);
        });

        $input_url.off('keyup').on('keyup', function(e) {
          let url = $input_url.val();

          if(e.keyCode === 13) {
            if(mayCreate) $submit.click();
            return;
          }

          if(url === '') {
            urlValid = false;
          } else {
            try {
              let urlObj = new URL(url);
              urlValid = true;
            } catch (error) {
              urlValid = false;
            }
          }

          if(urlValid === false) {
            $input_url.addClass('error-input');
          } else {
            $input_url.removeClass('error-input');
          }

          mayCreate = nameValid && urlValid;
          $submit.attr('disabled', !mayCreate);
        });

        $($div).find('input[type=submit]').off('click').on('click', function() {
          if($(this).attr('name') === 'cancel') {
            return $k_display.close();
          }

          var name = $input_name.val()+'.'+app.BURL_EXTENSION;

          app._addBurl($d, name, $input_url.val());
        })
      }
    }).data("kendoBalloonWindow").center().open();

    return $d;
  },

  /**
   * Add new burl file with given name
   *
   * @param string name
   * @return void
   */
  _addBurl: function($d, name, url) {
    var $div = $('#fs-burl-window');

    name = encodeURI(name);
    this.balloon.xmlHttpRequest({
      url: this.balloon.base+'/files?name='+name+'&'+this.balloon.param('collection', this.balloon.getCurrentCollectionId()),
      type: 'PUT',
      data: url,
      success: function(data) {
        this.balloon.refreshTree('/collections/children', {id: this.balloon.getCurrentCollectionId()});
        app.balloon.added_rename = data.id;
        $div.data('kendoBalloonWindow').close();
        $div.remove();
        $d.resolve(data);
      }.bind(this),
      error: function(error) {
        app.balloon.displayError(error);
        $d.reject();
      }
    });

    return $d;
  },

  /**
   * Handle Burl file
   *
   * @param  object node
   * @return void
   */
  handleBurl: function(node) {
    this.balloon.xmlHttpRequest({
      url: this.balloon.base+'/files/content',
      type: 'GET',
      data: {
        id: this.balloon.id(node),
      },
      dataType: 'text',
      success: function (data) {
        try {
          let url = new URL(data);
          var msg  = i18next.t('app.burl.prompt.open_burl', url.href);
          this.balloon.promptConfirm(msg, this._handleBurl, [url]);
        } catch (error) {
          this.balloon.displayError(error);
        }
      }.bind(this)
    });
  },


  /**
   * Handle Burl file
   *
   * @param  object node
   * @return void
   */
  _handleBurl: function(url) {
    window.open(url.href, '_blank');
  },
}

export default app;
