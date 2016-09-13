;;; steemcli.el --- Post the file you're editting to Steem

;; Copyright (c) 2016 Pedro Tacla Yamada
;; Author: Pedro Tacla Yamada <tacla.yamada@gmail.com>
;; Version: 0.0.1
;; Homepage: https://github.com/yamadapc/steemcli

(defun steem-buffer()
  (let* ((cb (current-buffer))
         (cfp (buffer-file-name cb)))
    (message cfp)))

(steem-buffer)
