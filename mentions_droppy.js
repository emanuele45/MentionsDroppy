/**
 * Mentions Droppy
 *
 * @name      Mentions Droppy
 * @copyright Mentions Droppy contributors
 * @license   BSD http://opensource.org/licenses/BSD-3-Clause
 *
 * @version 0.1
 *
 */

$(document).ready(function() {
	$('#button_mention').addClass('subsections');
	$('#button_mention a').Elk_Droppy({
		find: 'action=mentions',
		replace: 'action=mentions_ajax',
		first_template: '<div class="utils"><div class="mentions">{mentions_link}</div><div class="options">{options_link}</div></div>'
	});
});

(function($) {
	$.fn.Elk_Droppy = function(options) {
		var settings = {
			'limit' : 5,
			'find' : '',
			'replace' : '',
			'template' : '<div class="member"><a href="' + elk_scripturl + '?action=profile;u={member_id}"><img class="avatar" src="{avatar_href}" /></a></div><div class="message">{message}</div><div class="logtime">{html_time}</div>',
			'first_template' : '',
		};

		$.extend(settings, options);

		return this.each(function() {
			var $btn = $(this),
				url = '',
				// It's the easiest way to rely on a color that should work
				font_color = $('body').css('color');
			$btn.click(function (e) {
				e.preventDefault();

				if (settings.find != '' && settings.replace != '')
					url = $btn.attr('href').replace(settings.find, settings.replace);
				else
					url = $btn.attr('href');

				$.ajax({
					type: 'GET',
					// That's a bit of a trick, though it's easier than change the urls. :P
					url: url + ';xml;api=json;limit=' + settings.limit,
					dataType: 'json',
					beforeSend: ajax_indicator(true)
				})
				.done(function(resp) {
					var $ul = $('<ul class="menulevel2" />').attr('role', 'menu').css({color: font_color});

					if (settings.first_template != '')
					{
						var insert = settings.first_template
							.replace('{mentions_link}', resp.ui.mentions_link)
							.replace('{options_link}', resp.ui.options_link);

						$ul.append($('<li class="listlevel2" />')
							.attr('role', 'menuitem')
							.html('<div class="outer">' + insert + '</div>'));
					}

					$.each(resp.data, function(idx, elem) {
						$ul.append($('<li class="listlevel2" />')
							.attr('role', 'menuitem')
							.html(settings.template
								.replace('{member_id}', elem.member_id)
								.replace('{message}', elem.message)
								.replace('{avatar_href}', elem.avatar)
								.replace('{time}', elem.time.time)
								.replace('{html_time}', elem.time.html_time)
								.replace('{timestamp}', elem.time.timestamp)
							));
					});

					$btn.after($ul);
				})
				.fail(function() {
					// ajax failure code
				})
				.always(function() {
					// turn off the indicator
					ajax_indicator(false);
					if (use_click_menu)
						$('#main_menu').superclick('destroy').superclick({speed: 150, animation: {opacity:'show', height:'toggle'}});
					else
						$('#main_menu').superfish('destroy').superfish({delay : 300, speed: 175});

					$btn.parent().superfish('show');
					updateRelativeTime();
				});
			});
		});
	};
})( jQuery );