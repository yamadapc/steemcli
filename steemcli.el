;;; steemcli.el --- Post the file you're editting to Steem

;; Copyright (c) 2016 Pedro Tacla Yamada
;; Author: Pedro Tacla Yamada <tacla.yamada@gmail.com>
;; Version: 0.0.1
;; Homepage: https://github.com/yamadapc/steemcli

(defun steem-buffer()
  (interactive)
  (let* ((cb (current-buffer))
         (cfp (buffer-file-name cb)))
    (if (not cfp)
        (error "No file-name for this buffer")
      (async-shell-command (concat "steemcli -v " cfp))
      (display-buffer-pop-up-window "*Async Shell Command*" nil))))

; (setenv "STEEM_USERNAME" "")
; (setenv "STEEM_PASSWORD" "")
(steem-buffer)
