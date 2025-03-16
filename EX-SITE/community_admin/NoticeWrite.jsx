import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/NoticeWrite.css';
import axios from 'axios';

const NoticeWrite = () => {

    const [noticeTitle, setNoticeTitle] = useState('');
    const [noticeContent, setNoticeContent] = useState('');
    const navigate = useNavigate();

    const handleNoticeRegister = async () => {
        if (!noticeTitle || !noticeContent) {
            alert('제목과 내용을 모두 입력하세요.');
            return;
        }

        try {
            await axios.post('/api/community/notice', {
                postTitle: noticeTitle,
                postContent: noticeContent
            });
            alert('공지사항이 등록되었습니다.');
            navigate('/admin/post-management');
        } catch (error) {
            console.error('Error registering notice:', error);
            alert('공지사항 등록 중 오류가 발생했습니다.');
        }
    };



    return (
        <div className="notice-container">
            <div className="notice-section">공지사항 작성</div>
            <div className="notice-info">
                공지 사항을 작성해 주세요. 게시판 상단에 노출됩니다.
            </div>
            <div className="notice">
                <div className="notice-title">공지사항 제목</div>
                <input
                    type="text"
                    className="notice-title-content"
                    value={noticeTitle}
                    onChange={(e) => setNoticeTitle(e.target.value)}
                />
            </div>
            <div className="notice-content">
                <div className="notice-content-title">공지사항 내용</div>
                <textarea
                    className="notice-content-description"
                    value={noticeContent}
                    onChange={(e) => setNoticeContent(e.target.value)}
                ></textarea>
            </div>

            <div className="registration-buttons">
                <button type="button" className="registration-button" onClick={handleNoticeRegister}>등록</button>
            </div>
        </div>
    );
};

export default NoticeWrite;