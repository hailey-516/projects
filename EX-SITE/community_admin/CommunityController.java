package com.teamx.exsite.controller.community;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;

import com.google.gson.Gson;
import com.teamx.exsite.common.model.vo.PageInfo;
import com.teamx.exsite.common.template.Pagination;
import com.teamx.exsite.model.dto.community.ParentReplyDTO;
import com.teamx.exsite.model.dto.user.UserDTO;
import com.teamx.exsite.model.vo.community.Board;
import com.teamx.exsite.model.vo.community.ChildrenReply;
import com.teamx.exsite.model.vo.community.ParentReply;
import com.teamx.exsite.service.community.BoardService;

import jakarta.servlet.http.HttpSession;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Controller
public class CommunityController {
	
	private final BoardService boardService;
	
	@Autowired
	public CommunityController(BoardService boardService) {
		this.boardService = boardService;
	}

	/**
	 * 관리자 페이지 게시글 목록 불러오는 메소드
	 * @return 게시글 목록 조회 결과
	 */
	@ResponseBody
	@GetMapping("/api/community/list")
	public List<Board> selectPostList() {
		
		return boardService.selectPostList();
		
	}
	
	/**
	 * 관리자 페이지 카테고리 변경하는 메소드
	 * @param requestData 카테고리, 게시글 번호
	 * @return 카테고리 업데이트 결과
	 */
	@ResponseBody
	@PostMapping("api/community/category")
	public int updateCategory(@RequestBody Map<String, Object> requestData) {
	    String category = (String) requestData.get("category");
	    int postNo = (int) requestData.get("postNo");

	    return boardService.updateCategory(category, postNo);
	}
	
	/**
	 * 관리자 페이지 커뮤니티 게시글 삭제하는 메소드
	 * @param requestData 선택된 게시글 배열
	 * @retun 게시글 상태 업데이트 결과
	 */
	@ResponseBody
	@PostMapping("/api/community/delete")
	public int deletePosts(@RequestBody Map<String, Object> requestData) {
		List<Integer> postNos = (List<Integer>) requestData.get("postNos");
		return boardService.deletePosts(postNos);
	}
	
	/**
	 * 관리자 페이지 공지사항 작성하는 메소드
	 * @param requestData 공지 제목, 공지 내용
	 * @param session
	 * @return 공지 사항 insert 결과
	 */
	@ResponseBody
	@PostMapping("/api/community/notice")
	public int insertNotice(@RequestBody Map<String, Object> requestData, HttpSession session) {
		String postTitle = (String) requestData.get("postTitle");
		String postContent = (String) requestData.get("postContent");

		UserDTO loginUser = (UserDTO) session.getAttribute("loginUser");
		int userNo = loginUser.getUserNo();
		
		return boardService.insertNotice(postTitle, postContent, userNo);
	}
	
	/*****************************/
	
	/**
	 * 공지 게시글 조회해 오는 메소드
	 * @return 공지 게시글 select 결과
	 */
	public List<Board> selectNotice() {
		return boardService.selectNotice();
	}
	
	/**
	 * 관리자 페이지 게시글 검색 메소드
	 * @return 검색 결과
	 */
	@ResponseBody
	@GetMapping("/api/community/search")
	public List<Board> searchPost(String keyword) {
		return boardService.searchPost(keyword);
	}

	
}
