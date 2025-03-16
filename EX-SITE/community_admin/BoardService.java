package com.teamx.exsite.service.community;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.apache.ibatis.session.RowBounds;
import org.springframework.stereotype.Service;

import com.teamx.exsite.common.model.vo.PageInfo;
import com.teamx.exsite.model.dto.community.ChildrenReplyDTO;
import com.teamx.exsite.model.dto.community.ParentReplyDTO;
import com.teamx.exsite.model.mapper.community.BoardMapper;
import com.teamx.exsite.model.vo.community.Board;
import com.teamx.exsite.model.vo.community.ChildrenReply;
import com.teamx.exsite.model.vo.community.ParentReply;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BoardService {

	private final BoardMapper mapper;

	public int insertBoard(Board board) {
		return mapper.insertBoard(board);
	}

	public int selectListCount() {
		return mapper.selectListCount();
	}

	public ArrayList<Board> selectList(PageInfo pi) {

		// offset: 데이터 조회의 시작 위치를 지정하는 값으로, 예를 들어 offset이 10이라면 10번째 레코드부터 데이터를 조회
		// limit: 조회할 최대 레코드 수를 지정하는 값으로, 예를 들어 limit이 10이라면 최대 10개의 레코드만 조회
		int offset = (pi.getCurrentPage() - 1) * pi.getBoardLimit();
		RowBounds rowBounds = new RowBounds(offset, pi.getBoardLimit());
		// 예시)
		// offset = (현재 페이지 - 1) * 페이지 당 게시글 수 = (2 - 1) * 15 = 15
		// limit = 15 (한 페이지에 표시할 게시글 수) => RowBounds에 매개변수로 15, 15를 전달하면 15번째 로우부터 15개
		// 조회해서 반환해줌(레전드;;)
		// 이모든걸 마이바티스 rowBounds가 해준다 이말씀

		return mapper.selectList(pi, rowBounds);
	}

	public int increaseViewCount(int postNo) {
		return mapper.increaseViewCount(postNo);
	}

	public Board selectDetail(int postNo) {
		return mapper.selectDetail(postNo);
	}

	public int editBoard(Board board) {
		return mapper.editBoard(board);
	}

	public int deleteBoard(Board board) {
		return mapper.deleteBoard(board);
	}
	
	public int checkReport(int userNo, int postNo) {
		return mapper.checkReport(userNo, postNo);
	}
	
	public int increaseReportCount(int userNo, int postNo) {
		return mapper.increaseReportCount(userNo, postNo);
	}

	public int selectListCountByCategory(String postCategory) {
		return mapper.selectListCountByCategory(postCategory);
	}

	public ArrayList<Board> selectPostsByCategory(String postCategory, PageInfo pi) {

		// 페이징처리
		int offset = (pi.getCurrentPage() - 1) * pi.getBoardLimit();
		RowBounds rowBounds = new RowBounds(offset, pi.getBoardLimit());

		return mapper.selectPostsByCategory(postCategory, pi, rowBounds);
	}

	public int insertParentReply(ParentReply parentReply) {
		return mapper.insertParentReply(parentReply);
	}

	public ArrayList<ParentReply> selectParentReply(int postNo) {
		return mapper.selectParentReply(postNo);
	}

	public int insertChildrenReply(ChildrenReply childrenReply) {
		return mapper.insertChildrenReply(childrenReply);
	}

	public ArrayList<ChildrenReply> selectChildrenReply(int parentReplyNo) {
		return mapper.selectChildrenReply(parentReplyNo);
	}

	public int deleteParentReply(ParentReply parentReply) {
		return mapper.deleteParentReply(parentReply);
	}

	public int deleteChildrenReply(ChildrenReply childrenReply) {
		return mapper.deleteChildrenReply(childrenReply);
	}

	public int editParentReply(ParentReply parentReply) {
		return mapper.editParentReply(parentReply);
	}

	public int editChildrenReply(ChildrenReply childrenReply) {
		return mapper.editChildrenReply(childrenReply);
	}

	public List<Board> selectPostList() {
		return mapper.selectPostList();
	}

	public int updateCategory(String category, int postNo) {
		return mapper.updateCategory(category, postNo);
	}

	public int deletePosts(List<Integer> postNos) {
		return mapper.deletePosts(postNos);
	}

	public int insertNotice(String postTitle, String postContent, int userNo) {
		return mapper.insertNotice(postTitle, postContent, userNo);
	}

	public List<Board> selectNotice() {
		return mapper.selectNotice();
	}

	public List<Board> searchPost(String keyword) {
		return mapper.searchPost(keyword);
	}

	public ArrayList<ParentReplyDTO> adminSelectParentReply(String searchKeyword) {
		
		ArrayList<ParentReplyDTO> parentReplyList =  mapper.adminSelectParentReply(searchKeyword);
		ArrayList<ParentReplyDTO> childrenReplyList =  mapper.adminSelectChildrenReply(searchKeyword);
		
		
		// 부모 댓글 번호를 키값으로 가지는 자식 댓글 리스트들의 맵 
		Map<Integer, List<ParentReplyDTO>> parentChildMap = childrenReplyList.stream().collect(Collectors.groupingBy(ParentReplyDTO::getParentReplyNo));
		
		
		ArrayList<ParentReplyDTO> allReply = new ArrayList<>();
		
		// 조회해온 부모댓글 리스트를 반복문으로 부모댓글번호를 하나씩 꺼내서 parentNo에 초기화 한 뒤
		// allReply에 parentNo에 해당하는 부모댓글을 먼저 add하고 해당 부모댓글의 parentNo와 동일한 자식댓글을 다음차례대로 반복문을 통해 add 
		for(ParentReplyDTO parentReply : parentReplyList) {
			int parentReplyNo = parentReply.getParentReplyNo();
			
			if(parentReply.getParentReplyStatus().equals("N")) {
				allReply.add(parentReply);
			}
		
			if(parentChildMap.get(parentReplyNo)!=null) {
				for(ParentReplyDTO childrenReply : parentChildMap.get(parentReplyNo)) {
					allReply.add(childrenReply);
				}
			}
		}
		
		return allReply;
	}

	public int adminDeleteParentReply(List<Integer> parentReplyNos) {
		return mapper.adminDeleteParentReply(parentReplyNos);
	}

	public int adminDeleteChildrenReply(List<Integer> childrenReplyNos) {
		return mapper.adminDeleteChildrenReply(childrenReplyNos);
	}

	public int checkReportCount(int postNo) {
		return mapper.checkReportCount(postNo);
	}

	public int deleteReportedBoard(int postNo) {
		return mapper.deleteReportedBoard(postNo);
	}


}
