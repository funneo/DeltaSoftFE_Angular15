import { Injectable } from '@angular/core';
declare var alertify: any;
@Injectable()
export class NotificationService {
  private _notifier: any = alertify;
  constructor() {
    alertify.defaults = {
      // dialogs defaults
      autoReset: true,
      basic: false,
      closable: true,
      closableByDimmer: true,
      frameless: false,
      maintainFocus: true, // <== global default not per instance, applies to all dialogs
      maximizable: true,
      modal: true,
      movable: true,
      moveBounded: false,
      overflow: true,
      padding: true,
      pinnable: true,
      pinned: true,
      preventBodyShift: false, // <== global default not per instance, applies to all dialogs
      resizable: true,
      startMaximized: false,
      transition: 'pulse',

      // notifier defaults
      notifier: {
        // auto-dismiss wait time (in seconds)
        delay: 5,
        // default position
        position: 'bottom-right',
        // adds a close button to notifier messages
        closeButton: false
      },

      // language resources
      glossary: {
        // dialogs default title
        title: 'Xác nhận',
        // ok button text
        ok: 'Đồng ý',
        // cancel button text
        cancel: 'Hủy'
      },

      // theme settings
      theme: {
        // class name attached to prompt dialog input textbox.
        input: 'ajs-input',
        // class name attached to ok button
        ok: 'ajs-ok',
        // class name attached to cancel button
        cancel: 'ajs-cancel'
      },
      // global hooks
      hooks: {
        // invoked before initializing any dialog
        preinit: function () { },
        // invoked after initializing any dialog
        postinit: function () { },
      }
    };

  }

  printSuccessMessage(message: string) {
    this._notifier.success(message);
  }

  printErrorMessage(message: string) {
    this._notifier.error(message);
  }
  prinWarningMessage(message: string) {
    this._notifier.warning(message);
  }
  printMessage(message: string) {
    this._notifier.message(message);
  }


  printAlert(title:string,message:string,confirm:string=null){
    this._notifier.alert().setting({
      'label':confirm??'Xác nhận',
      'message':message,
      'title':title
    }).show()
  }


  printConfirmationDialog(message: string, okCallback: () => any) {
    this._notifier.confirm(message, function (e) {
      if (e) {
        okCallback();
      } else {
      }
    });
  }

  printConfirmationYesNo(message: string, okCallback: () => any, noCallback: () => any) {
    this._notifier.confirm(message, function (e) {
      if (e) {
        okCallback();
      } else {
        noCallback();
      }
    }, function () { noCallback() });
  }

}
