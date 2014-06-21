<?php

/**
 * Mentions Droppy
 *
 * Handles all the mentions actions done through the mentions droppy
 * so members are notified of mentionalbe actions
 *
 * @name      Mentions Droppy
 * @copyright Mentions Droppy contributors
 * @license   BSD http://opensource.org/licenses/BSD-3-Clause
 *
 * @version 0.1
 *
 */

if (!defined('ELK'))
	die('No access...');

require_once(CONTROLLERDIR . '/Mentions.controller.php');
/**
 * Mentions_Controller Class:  Add mention notificaions for various actions such
 * as liking a post, adding a buddy, @ calling a member in a post
 *
 * @package Mentions
 */
class Mentions_ajax_Controller extends Mentions_Controller
{
	/**
	 * Creates a list of mentions for the user
	 * Allows them to mark them read or unread
	 * Can sort the various forms of mentions, likes or @mentions
	 */
	public function action_list()
	{
		global $context;

		parent::action_list();

		loadTemplate('Json');
		$context['sub_template'] = 'send_json';
	}

	/**
	 * Callback for createList(),
	 * Returns the mentions of a give type (like/mention) & (unread or all)
	 *
	 * @param int $start start list number
	 * @param int $limit how many to show on a page
	 * @param string $sort which direction are we showing this
	 * @param bool $all : if true load all the mentions or type, otherwise only the unread
	 * @param string $type : the type of mention
	 */
	public function list_loadMentions($start, $limit, $sort, $all, $type)
	{
		global $context, $txt, $scripturl;

		$limit = isset($_GET['limit']) ? (int) $_GET['limit'] : 5;
		$limit = !empty($limit) ? $limit : 5;
		
		$mentions = parent::list_loadMentions($start, $limit, $sort, $all, $type);

		$context['json_data'] = array(
			'ui' => array(
				'mentions_link' => '<a href="' . $scripturl . '?action=mentions;all">' . $txt['mention'] . '</a>',
				'options_link' => '<a href="' . $scripturl . '?action=profile;area=notifications">' . $txt['settings'] . '</a>'
			),
			'data' => array()
		);

		$mention_ids = array();
		foreach ($mentions as $id => $mention)
		{
			$this->setData(array(
				'id_mention' => $mention['id_mention'],
				'mark' => 'read',
			));

			if ($this->_isAccessible())
				changeMentionStatus($this->_validator->id_mention, $this->_known_status['read']);

			$context['json_data']['data'][] = array(
				'status' => $mention['status'],
				'member_id' => $mention['id_member_from'],
				'avatar' => $mention['avatar']['href'],
				'message' => $mention['message'],
				'time' => array(
					'time' => standardTime($mention['log_time']),
					'html_time' => htmlTime($mention['log_time']),
					'timestamp' => forum_time(true, $mention['log_time']),
				),
			);
		}

		return $mentions;
	}
}