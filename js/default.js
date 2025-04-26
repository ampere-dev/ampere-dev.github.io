/***
 * Frameweld Website module. This module will have all the global vars used throughout the site.
 */
FWTK.modules.fws = function(fw) {
    var FWS       = this,
        BODY_TAG  = null,
        PAGE_KEY  = null,
        PAGES     = {};

    function _init() {
        BODY_TAG = $('body');
        PAGE_KEY = BODY_TAG.attr('data-page-key');
    }

    /**
     * BEGIN GLOBAL HANDLERS
     */
    function _handlerAccessibility() {
        $('input[role="button"], button[role="button"]').on('click keypress', function(e) {
            if (e.type === 'click' || (e.type === 'keypress' && (e.key === 'Enter' || e.key === ' '))) {
                e.preventDefault();
                var btn = $(this);
                btn.attr('aria-pressed', true);
                if (btn.attr('data-url')) {
                    if (btn.attr('data-target')) {
                        _openWindow(btn.attr('data-url'));
                    } else {
                        window.location = btn.attr('data-url');
                    }
                }
            }
        });

        $('input[role="checkbox"]').click(function(e) {
            var me = this;
            $(me).attr('aria-checked', me.checked);
        });
    }

    function _handlerScroll() {
        var HTML_BODY = $('html, body'),
            SCROLL    = $("#scrollto");

        $("#scroll").click(function() {
            HTML_BODY.animate({ scrollTop: SCROLL.offset().top - 55 }, 1000);
        });

        $('.scroll').click(function(e) {
            e.preventDefault();
            var ELEMENT = $(this);
            HTML_BODY.animate({ scrollTop: $(ELEMENT.attr('href')).offset().top - 55 }, 1000);
        });
    }

    function _handlerNav() {
        var HEADER = $('#fw-header'),
            checkDistance = function() {
                var distanceY = window.pageYOffset || document.documentElement.scrollTop,
                    shrinkOn  = 300;

                if (distanceY > shrinkOn) {
                    HEADER.addClass('smaller');
                } else {
                    HEADER.removeClass('smaller');
                }
            };

        checkDistance();

        // Use requestAnimationFrame for smoother scroll handling
        let ticking = false;
        window.addEventListener('scroll', function() {
            if (!ticking) {
                requestAnimationFrame(function() {
                    checkDistance();
                    ticking = false;
                });
                ticking = true;
            }
        });

        var mobile_menu = $('#menu-toggle-inner'),
            mobile_menu_link = $('#mobile-menu-link');

        mobile_menu_link.click(function(e) {
            _prevent(e);
            mobile_menu.slideToggle();
            mobile_menu_link.toggleClass('active');
        });
    }

    /**
     * END GLOBAL HANDLERS
     */

    /**
     * This method will prevent the default bubble of an event from occurring.
     * @private
     */
    function _prevent(e) {
        e.preventDefault();
    }

    /**
     * Aborts with a custom error message.
     * @private
     * @throws Error
     */
    function _abort(message) {
        throw new Error(message);
    }

    /**
     * Checks if an element exists on the page.
     * @param elem The element to lookup.
     * @private
     */
    function _exists(elem) {
        return $(elem).length > 0 ? true : false;
    }

    /**
     * This method will parse a JSON string into a JSON object.
     * @param string Parse a valid JSON string into an object.
     * @private
     * @returns {Object}
     */
    function _parseJson(string) {
        if (_typeOf(string, 'object')) {
            return string;
        }
        return $.parseJSON(string);
    }

    /**
     * This method will return if the obj is the same type of requested object.
     * @param obj The object to check its type.
     * @param type The type to check for.
     * @private
     * @returns {Boolean}
     */
    function _typeOf(obj, type) {
        return typeof obj === type;
    }

    /**
     * Get a random string using crypto.randomUUID.
     * @returns {string}
     */
    function _getRandomID() {
        // Polyfill for older browsers if crypto.randomUUID is not available
        if (!window.crypto || !window.crypto.randomUUID) {
            return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        }
        return window.crypto.randomUUID().replace(/-/g, '');
    }

    /**
     * This method will open a window.
     * @param url The url to open up.
     * @param name The name of the window being opened.
     * @param args The arguments to pass to the opener.
     * @private
     */
    function _openWindow(url, name, args) {
        window.open(url, name || '', args || '');
    }

    /**
     * This method will show the main message that floats on top of the page.
     * @private
     * @param $msg The message to show.
     */
    function _showMessage($msg) {
        var container     = (arguments.length > 1) ? arguments[1] : '#message-success',
            msg_container = $(container),
            para          = msg_container.find('p');

        if ($msg) {
            para.html($msg);
        }

        msg_container.fadeIn('fast', function() {
            setTimeout(function() {
                msg_container.fadeOut('fast');
            }, 10000);
        });
    }

    /**
     * NOTE: All public properties and methods go below.
     */
    FWS.init        = _init;
    FWS.PAGE_KEY    = function() { return PAGE_KEY; };
    FWS.PAGES       = function() { return PAGES; };
    FWS.BODY_TAG    = function() { return BODY_TAG; };
    FWS.exists      = _exists;
    FWS.typeOf      = _typeOf;
    FWS.prevent     = _prevent;
    FWS.abort       = _abort;
    FWS.parseJson   = _parseJson;
    FWS.showMessage = _showMessage;
    FWS.load        = function() {
        _init();
        _handlerNav();
        _handlerScroll();
        _handlerAccessibility();

        if (FWS.PAGES.hasOwnProperty(PAGE_KEY)) {
            var id = _getRandomID();
            FWS[id] = eval(FWS.PAGES[PAGE_KEY]);
            FWS[id]();
        }
    };

    fw.fws = FWS;
};

FWTK('ajax', 'fws', 'components', function(fw) {
    var FWS = fw.fws;

    fw.components('modal');
    var modals = fw.modal();

    FWS.PAGES = {
        index: function() {
            var THUMBS = $('.thumb'),
                SLIDER = $('.client-slider').royalSlider({
                    autoPlay: {
                        enabled: true,
                        pauseOnHover: true,
                        delay: 5000
                    },
                    navigateByClick: true,
                    arrowsNav: false,
                    arrowsNavAutoHide: true,
                    arrowsNavHideOnTouch: true,
                    keyboardNavEnabled: true
                }).data('royalSlider');

            SLIDER.ev.on('rsAfterSlideChange', function(event) {
                THUMBS.removeClass('on');
                $(".thumb:eq(" + SLIDER.currSlideId + ")").addClass("on");
            });

            THUMBS.click(function(e) {
                var thumb = $(this);
                $('.thumb').removeClass('on');
                SLIDER.goTo(thumb.attr('data-slideId'));
                thumb.addClass('on');
            }).css({'pointer': 'cursor'});
        },
        whyUs: function() {
            $('#unfold-all-papers').click(function(e) {
                e.preventDefault();
                $('.paperfold:not(:visible)').each(function() {
                    $('#' + this.id).slideToggle();
                });
            });

            $('.paper-fold-container').each(function() {
                var me    = $(this),
                    btn   = me.find('.paperfold-toggle'),
                    paper = me.find('.paperfold');

                btn.click(function() {
                    paper.slideToggle();
                });
            });
        },
        contact: function() {
            // No changes needed here as it's empty
        },
        events: function() {
            var links    = $('a[id^=link-]'),
                sections = $('div[id^=section-]');

            links.click(function(e) {
                FWS.prevent(e);
                links.removeClass('on');
                $(this).addClass('on');

                var section = this.id.split('-')[1];

                if (section === 'all') {
                    sections.show();
                } else {
                    sections.hide();
                    sections.each(function() {
                        if (this.id === 'section-' + section) {
                            $(this).show();
                            return false;
                        }
                    });
                }
            });
            backToTop();
        },
        gsaannouncement: function() {
            _handlerContactUs();
        },
        acceleratinginnovation: function() {
            _handlerContactUs();
        },
        learningcommunities: function() {
            _handlerContactUs();
        },
        resourcelibraries: function() {
            _handlerContactUs();
        },
        machinelearning: function() {
            _handlerContactUs();
        },
        cme: function() {
            _handlerContactUs();
        },
        caseStudiesWestat: function() {
            var WINDOW = $(window);

            function revealOnScroll() {
                var scrolled = WINDOW.scrollTop(),
                    win_height_padded = WINDOW.height() * 1.1;

                $('.revealOnScroll:not(.animated)').each(function() {
                    var $this = $(this),
                        offsetTop = $this.offset().top;

                    if (scrolled + win_height_padded > offsetTop) {
                        if ($this.data('timeout')) {
                            setTimeout(function() {
                                $this.addClass('animated ' + $this.data('animation'));
                                $('.timer').countTo();
                            }, parseInt($this.data('timeout'), 10));
                        } else {
                            $this.addClass('animated ' + $this.data('animation'));
                            $('.timer').countTo();
                        }
                    }
                });

                $('.revealOnScroll.animated').each(function() {
                    var $this = $(this),
                        offsetTop = $this.offset().top;

                    if (scrolled + win_height_padded < offsetTop) {
                        $(this).removeClass('animated');
                    }
                });
            }

            $.fn.countTo = function(options) {
                options = options || {};

                return $(this).each(function() {
                    var settings = $.extend({}, $.fn.countTo.defaults, {
                        from: $(this).data('from'),
                        to: $(this).data('to'),
                        speed: $(this).data('speed'),
                        refreshInterval: $(this).data('refresh-interval'),
                        decimals: $(this).data('decimals')
                    }, options);

                    var loops = Math.ceil(settings.speed / settings.refreshInterval),
                        increment = (settings.to - settings.from) / loops;

                    var self = this,
                        $self = $(this),
                        loopCount = 0,
                        value = settings.from,
                        data = $self.data('countTo') || {};

                    $self.data('countTo', data);

                    if (data.interval) {
                        clearInterval(data.interval);
                    }
                    data.interval = setInterval(updateTimer, settings.refreshInterval);

                    render(value);

                    function updateTimer() {
                        value += increment;
                        loopCount++;
                        render(value);

                        if (typeof(settings.onUpdate) === 'function') {
                            settings.onUpdate.call(self, value);
                        }

                        if (loopCount >= loops) {
                            $self.removeData('countTo');
                            clearInterval(data.interval);
                            value = settings.to;

                            if (typeof(settings.onComplete) === 'function') {
                                settings.onComplete.call(self, value);
                            }
                        }
                    }

                    function render(value) {
                        var formattedValue = settings.formatter.call(self, value, settings);
                        $self.html(formattedValue);
                    }
                });
            };

            $.fn.countTo.defaults = {
                from: 0,
                to: 0,
                speed: 1000,
                refreshInterval: 100,
                decimals: 2,
                formatter: formatter,
                onUpdate: null,
                onComplete: null
            };

            function formatter(value, settings) {
                return value.toFixed(settings.decimals);
            }

            revealOnScroll();
            WINDOW.on('scroll', revealOnScroll);
        }
    };

    function _handlerContactUs() {
        $('#contact-us').submit(function(e) {
            e.preventDefault();

            var form       = $(this),
                container  = form.parents('div'),
                successmsg = container.find('#message-success'),
                errormsg   = container.find('#message-error');

            successmsg.hide();
            errormsg.hide();

            form.find('.input-error').removeClass('input-error');

            fw.makeRequest(
                {
                    url: location.pathname.replace('.html', '') + '/contact/',
                    method: 'POST',
                    data: form.serializeArray(),
                    dataType: 'json'
                },
                function(response) {
                    if (response.success) {
                        successmsg.text('Thanks for getting in touch with us.').fadeIn();
                        form[0].reset();
                        form.find('textarea').val('');
                    } else {
                        errormsg.text(response.data ? response.data : 'Internal error. Please refresh and try again.').fadeIn();
                        if (response.fields) {
                            var fields = response.fields.split(',');
                            for (var i in fields) {
                                form.find('input[name="' + fields[i] + '"], textarea[name="' + fields[i] + '"]').addClass('input-error');
                            }
                        }
                    }

                    form.find('[name="is_submitted"]').val(response.key);
                }
            );
        });
    }

    function backToTop() {
        $('.back-to-top').hide();

        $(window).scroll(function() {
            if ($(this).scrollTop() > 500) {
                $('.back-to-top').fadeIn();
            } else {
                $('.back-to-top').fadeOut();
            }
        });

        $('.back-to-top a').click(function() {
            $('body,html').animate({ scrollTop: 0 }, 1000);
            return false;
        });
    }

    FWS.load();
});
