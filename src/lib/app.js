/**
 * balloon
 *
 * @copyright Copryright (c) 2012-2018 gyselroth GmbH (https://gyselroth.com)
 * @license   GPL-3.0 https://opensource.org/licenses/GPL-3.0
 */

import office from '../app/Balloon.App.Office/lib/lib.js';
import convert from '../app/Balloon.App.Convert/lib/lib.js';
import notification from '../app/Balloon.App.Notification/lib/lib.js';
import clamav from '../app/Balloon.App.ClamAv/lib/lib.js';
import desktop from '../app/Balloon.App.DesktopClient/lib/lib.js';
import burl from '../app/Balloon.App.Burl/lib/lib.js';
import external from '../app/Balloon.App.ExternalStorage/lib/lib.js';
import intelligentCollection from '../app/Balloon.App.IntelligentCollection/lib/lib.js';

const map = {
  'Balloon.App.Office': office,
  'Balloon.App.Convert': convert,
  'Balloon.App.Notification': notification,
  'Balloon.App.ClamAv': clamav,
  'Balloon.App.DesktopClient': desktop,
  'Balloon.App.Burl': burl,
  'Balloon.App.ExternalStorage': external,
  'Balloon.App.IntelligentCollection': intelligentCollection,
};

var app = {
  apps: {
    'Balloon.App.Office': {enabled: true, config: {}},
    'Balloon.App.Convert': {enabled: true, config: {}},
    'Balloon.App.Notification': {enabled: true, config: {}},
    'Balloon.App.ClamAv': {enabled: true, config: {}},
    'Balloon.App.DesktopClient': {enabled: true, config: {}},
    'Balloon.App.Burl': {enabled: true, config: {}},
    'Balloon.App.ExternalStorage': {enabled: true, config: {}},
    'Balloon.App.IntelligentCollection': {enabled: true, config: {}}
  },

  init: function(config) {
    this.apps = $.extend(this.apps, config.apps || {});
  },

  isEnabled: function(app) {
    return this.apps[app] && this.apps[app].enabled === true;
  },

  render: function() {
    for (const [name, app] of Object.entries(this.apps)) {
      if(app.enabled === true && map[name]['render']) {
        map[name].render();
      }
    }
  },

  preInit: function(core) {
    for (const [name, app] of Object.entries(this.apps)) {
      if(app.enabled === true && map[name]['preInit']) {
        map[name].preInit(core);
      }
    }
  },

  postInit: function(core) {
    for (const [name, app] of Object.entries(this.apps)) {
      if(app.enabled === true && map[name]['postInit']) {
        map[name].postInit(core);
      }
    }
  }
};

export default app;
