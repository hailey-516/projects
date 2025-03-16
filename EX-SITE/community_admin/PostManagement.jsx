import React, { useEffect } from 'react';
import '../css/PostManagement.css';
import searchIcon from '../css/searchIcon.png';
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const PostManagement = () => {

    const navigate = useNavigate();

    const [posts, setPosts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const postsPerPage = 13;

    useEffect(() => {
        selectPostList();
    }, []);

    // community 테이블의 전체 데이터 불러오기
    const selectPostList = async () => {
        try {
            const response = await axios.get('/api/community/list');
            setPosts(response.data);
        } catch (error) {
            console.error("Error select post list", error);
            alert("게시글 목록을 가져오는 데 오류가 발생했습니다.");
        }
    };

    // 관리자 페이지에서 글의 카테고리 변경
    const handleCategoryChange = async (e, postNo) => {
        const value = e.target.value;
    
        try {
            await axios.post('/api/community/category', {
                category: value,
                postNo: postNo,
            });
            console.log('Category updated successfully!');
            alert('카테고리가 성공적으로 변경되었습니다.');
            
            // 상태 업데이트
            setPosts((prevPosts) =>
                prevPosts.map((post) =>
                    post.postNo === postNo ? { ...post, postCategory: value } : post
                )
            );
        } catch (error) {
            console.error('Error occurred while updating category:', error);
            alert('카테고리 변경 중 오류가 발생했습니다.');
        }
    };

    const [searchPost, setSearchPost] = useState('');
    // 게시글 검색 기능

    const handleSearch = async () => {

        if (!searchPost) {
            selectPostList();
            return;
        }

        try {
            const response = await axios.get(`/api/community/search?keyword=${searchPost}`);
            console.log(response.data);
            setPosts(response.data);
            setSearchPost('');
        } catch (error) {
            console.error("Error searching posts", error);
            alert("검색 중 오류가 발생했습니다.");
        }
    }


    const [selectedPosts, setSelectedPosts] = useState(new Set());

    const handleSelectPost = (postNo) => {
        const newSelectedPosts = new Set(selectedPosts);
        if (newSelectedPosts.has(postNo)) {
            newSelectedPosts.delete(postNo); // 이미 선택된 경우 선택 해제
        } else {
            newSelectedPosts.add(postNo); // 선택
        }
        setSelectedPosts(newSelectedPosts);
    };

    // 선택된 게시글 삭제
    const handleDeleteSelected = async () => {
        const selectedPostNos = Array.from(selectedPosts);

        if (selectedPostNos.length === 0) {
            alert("삭제할 게시글을 선택하세요.");
            return;
        }

        if(!window.confirm("선택한 게시글을 삭제하시겠습니까?")) {
            return;
        }

        try {
            // 서버로 선택된 게시글 번호 배열 전송
            await axios.post('/api/community/delete', {
                postNos: selectedPostNos,
            });
            alert("선택된 게시글이 삭제되었습니다.");

            // 상태 업데이트: 삭제된 게시글 제외
            setPosts((prevPosts) =>
                prevPosts.filter((post) => !selectedPosts.has(post.postNo))
            );
            setSelectedPosts(new Set());    // 선택 초기화
        } catch (error) {
            console.error("Error occurred while deleting posts:", error);
            alert("게시글 삭제 중 오류가 발생했습니다.");
        }
    };

    // "공지" 카테고리를 가진 게시글을 상단에 고정
    const sortedPosts = [...posts].sort((a, b) => {
        if (a.category === '공지' && b.category !== '공지') return -1; // a가 공지면 먼저
        if (b.category === '공지' && a.category !== '공지') return 1; // b가 공지면 나중
        return 0; // 같으면 순서 유지
    });

    // 현재 페이지 전시 정보 계산
    const indexOfLastPost = currentPage * postsPerPage;
    const indexOfFirstPost = indexOfLastPost - postsPerPage;
    const currentPosts = posts.filter(post => post.status !== 'Y')
        .slice(indexOfFirstPost, indexOfLastPost);

    // 페이지네이션 버튼 핸들러
    const handlePageChange = (pageNumber) => {

        setCurrentPage(pageNumber);
    
    };

    const totalPages = Math.ceil(posts.length / postsPerPage);

    //페이지 버튼 제한
    const getVisiblePages = (currentPage, totalPages) => {

        const visiblePages = [];
        const startPage = Math.max(1, Math.floor((currentPage - 1) / 10) * 10 + 1);
        const endPage = Math.min(startPage + 9, totalPages);
    
        for (let i = startPage; i <= endPage; i++) {
            visiblePages.push(i);
        }
    
        return visiblePages;

    };

    // 페이지네이션 버튼 클릭 시 다음 페이지 세트로 이동
    const handleNextSet = () => {

        const nextPageSet = Math.floor((currentPage - 1) / 10) + 1;
        const newPage = nextPageSet * 10 + 1; // 다음 세트의 첫 페이지
        if (newPage <= totalPages) {
            setCurrentPage(newPage);
        }

    };

    // 페이지네이션 버튼 클릭 시 이전 페이지 세트로 이동
    const handlePrevSet = () => {

        const prevPageSet = Math.floor((currentPage - 1) / 10) - 1;
        const newPage = Math.max(prevPageSet * 10 + 1, 1); // 이전 세트의 첫 페이지
        setCurrentPage(newPage);
    
    };
        
    return (
        <div className="post-management-page">
            <div className="post-management-title">게시글 관리</div>
            <div className='post-management-search'>
                <input type="search" className="post-search-input" value={searchPost} onChange={(e) => {setSearchPost(e.target.value)}}></input>
                <img className="post-search-input-image" src={searchIcon} onClick={handleSearch}></img>
            </div>
                <div className="post-management-button">
                    <button className="delete-button" onClick={handleDeleteSelected}>삭제</button>
                    <button className="write-button" onClick={() => navigate('/admin/notice-write')}>공지 작성</button>
                </div>
                    <table className='post-management-table'>
                        <thead className='post-management-thead'>
                            <tr>
                                <th>
                                    <label className="custom-circle-checkbox">
                                        <input type="checkbox" className="post-management-checkbox"
                                                onChange={() => {
                                                    if (selectedPosts.size === posts.length) {
                                                        setSelectedPosts(new Set()); // 모두 선택 해제
                                                    } else {
                                                        setSelectedPosts(new Set(posts.map(post => post.postNo))); // 모두 선택
                                                        setSelectedPosts(new Set(posts.map(post => post.postNo))); // 모두 선택
                                                    }
                                                }} 
                                                checked={selectedPosts.size === posts.length}
                                        />
                                        <span className="circle"></span> {/* 사용자 정의 원형 체크박스 */}
                                    </label>
                                </th>
                                <th className='post-management-thead-th'>글번호</th>
                                <th className='post-management-thead-th'>카테고리</th>
                                <th className='post-management-thead-th'>제목</th>
                                <th className='post-management-thead-th'>작성자</th>
                                <th className='post-management-thead-th'>작성일</th>
                                <th className='post-management-thead-th'>신고횟수</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentPosts.map((post, postNo) => (
                                <tr key={postNo}>
                                    <td className="post-management-input-checkbox">
                                        <label className="custom-circle-checkbox">
                                            <input 
                                                type="checkbox" 
                                                className="post-management-checkbox"
                                                checked={selectedPosts.has(post.postNo)} 
                                                onChange={() => handleSelectPost(post.postNo)} 
                                            />
                                            <span className="circle"></span> {/* 사용자 정의 원형 체크박스 */}
                                        </label>
                                    </td>
                                    <td className="post-info">
                                        {post.postCategory === '공지' ? ('') : (post.postNo)}
                                    </td>
                                    <td className="post-info">
                                        {post.postCategory === '공지' ? (
                                            <span>{post.postCategory}</span>
                                        ) : (
                                            <select id="role" name="postCategory"
                                                    value={post.postCategory}
                                                    onChange={(e) => handleCategoryChange(e, post.postNo)}>
                                                <option value="동행구인">동행 구인</option>
                                                <option value="기대평">기대평</option>
                                                <option value="정보공유">정보 공유</option>
                                                <option value="잡담">잡담</option>
                                            </select>
                                        )}
                                    </td>
                                    
                                    <td className="post-management-td">{post.postTitle}</td>
                                    <td className="post-info">{post.userId}</td>
                                    <td className="post-info">{post.postDatetime}</td>
                                    <td className="post-info">0</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="pagination">
                <div className="pagination11">
                    <button className="prev" onClick={handlePrevSet}>◀</button>
                </div>
                {getVisiblePages(currentPage, totalPages).map((page) => (
                    <div className="pagination1" key={page}>
                        <button
                            className={`pagination-button ${currentPage === page ? 'active' : ''}`}
                            onClick={() => handlePageChange(page)}
                        >
                            {page}
                        </button>
                    </div>
                ))}
                <div className="pagination12">
                    <button className="next" onClick={handleNextSet}>▶</button>
                </div>
            </div>
        </div>
    );
};

export default PostManagement;