const express = require('express');
const router = express.Router();
const {isLoggedIn, isNotLoggedIn} = require('./middlewares');
const { Post, User, Comment } = require('../models');
const sequelize = require('sequelize');
const paging = require('./paging');
const moment = require('moment');
const {addExp, lvPrint} = require('./exp');

// 프로필 페이지
router.get('/profile', isLoggedIn, async (req, res) => {
    try {
        const lvInfo = await lvPrint(req.user.id);

        res.render('profile', {
            title: 'profile - BalanceGame',
            user: req.user,
            lvInfo: lvInfo,
        });
    } catch (error) {
        console.error(error);
        next(error);
    }
});

// 회원가입 페이지
router.get('/sign-up', isNotLoggedIn, (req, res) => {
    res.render('sign-up', {
        title: '회원가입 - BalanceGame',
        user: req.user, // 회원 정보 - sign-up.pug 의 회원 정보 렌더링 하는 곳에 회원 정보가 들어감
        signUpError: req.flash('signUpError'),
    });
});


// 메인 페이지 www
router.get('/', async (req, res, next) => {
    try {
        let limitValue = 5;
        const freePosts = await Post.findAll({
            include: [{
                model: User, // 작성자를 가져옴
                attributes: ['id', 'nickname', 'level'],
            },],
            limit: limitValue,
            // attributes: { include: [[await Comment.count({}) ], 'count'] },
            order: [['createdAt', 'DESC']],
            where: { board_type: 'free' },
        });

        console.log(freePosts+"posttest");

        const vsPosts = await Post.findAll({
            include: [{
                model: User, // 작성자를 가져옴
                attributes: ['id', 'nickname', 'level'],
            },],
            limit: limitValue,
            order: [['createdAt', 'DESC']],
            where: { board_type: 'vs' },
        });

        const bestVsPosts = await Post.findAll({
            include: [{
                model: User, // 작성자를 가져옴
                attributes: ['id', 'nickname', 'level'],
            },],
            limit: limitValue,
            order: [['like', 'DESC'], ['createdAt', 'DESC']],
            where: { board_type: 'vs' },
        });


        const bestFreePosts = await Post.findAll({
            include: [{
                model: User, // 작성자를 가져옴
                attributes: ['id', 'nickname', 'level'],
            },],
            limit: limitValue,
            // attributes: { include: [[await Comment.count({}) ], 'count'] },
            order: [['like', 'DESC'], ['createdAt', 'DESC']],
            where: { board_type: 'free' },
        });


        let lvInfo;
        if(await req.isAuthenticated())
            lvInfo= await lvPrint(req.user.id);
        else
            lvInfo = null;

        res.render('index', {
            title: 'BalanceGame',
            user: req.user,
            freePosts,
            vsPosts,
            bestFreePosts,
            bestVsPosts,
            moment,
            lvInfo : lvInfo,
        });

    } catch (error) {
        console.error(error);
        next(error);
    }

});

// 로그인 페이지
router.get('/login', (req, res, next) => {
    res.render('login', {
        title: 'login - BalanceGame',
        user: req.user,
        loginError: req.flash('loginError'),
    });
});

// 게시글 작성 화면으로 이동
router.get('/write', isLoggedIn, (req, res, next) => {
    res.render('board/write', {
        title: 'post - write',
        user: req.user,
        postError: req.flash('postError'),
    });
});

// 게시글 검색 기능
router.get('/search/:page', async (req, res, next) => {
    try {
        const path = '/search/';
        const searchWord = req.query.search;
        const searchWordUrl = '?search=' + searchWord;
        const curPage = req.params.page;
        const pageSize = 10; // 한 페이지 당 게시글
        const pageListSize = 5; // 페이지의 갯수
        console.log("searchWord : " + searchWord);
        let offset = ""; // limit 변수
        let totalPostCount = 0; // 전체 게시글 수

        const post = await Post.findAndCountAll({
          where: {
            title: {
              [sequelize.Op.like]: '%' + searchWord + '%'
            }
          }
        });
        totalPostCount = post.count;

        // let { totalPage, totalSet, curSet, startPage, endPage, no } = paging(totalPostCount, curPage, pageSize, pageListSize, offset);
        let result = paging(totalPostCount, curPage, pageSize, pageListSize, offset);

        const posts = await Post.findAll({
            include: [{
              model: User, // 작성자를 가져옴
              attributes: ['id', 'nickname'],
            },],
            offset: result.offset,
            limit: pageSize,
            order: [['createdAt', 'DESC']],
            where: {
                title: {
                  [sequelize.Op.like]: '%' + searchWord + '%'
                }
            }
        });
        res.render('board/board', {
            title: 'board',
            type: '검색 결과',
            posts: posts,
            user: req.user,
            count: totalPostCount,
            result,
            pageSize,
            pageListSize,
            curPage,
            moment,
            path,
            searchWordUrl,
        });


    } catch (error) {
      console.error(error);
      next(error);
    }
});

// 내가 쓴 글 기능
router.get('/my-posts/:page', isLoggedIn, async (req, res, next) => {
    try{
        const board_type = 'my-posts'; // req.params.type;
        const path = '/board/' + board_type + '/';
        const type = '내가 쓴 글';
        const curPage = req.params.page;
        const pageSize = 10; // 한 페이지 당 게시글
        const pageListSize = 5; // 페이지의 갯수

        let offset = ""; // limit 변수
        let totalPostCount = 0; // 전체 게시글 수

        const post = await Post.findAndCountAll({
            where: { userId: req.user.id },
        });
        totalPostCount = post.count;

        // 페이징
        let result = paging(totalPostCount, curPage, pageSize, pageListSize, offset);

        const posts = await Post.findAll({
            include: [{
                model: User, // 작성자를 가져옴
                attributes: ['id', 'nickname'],
            },],
            offset: result.offset,
            limit: pageSize,
            order: [['createdAt', 'DESC']],
            where: { userId: req.user.id },
        });
        res.render('board/board', {
            title: board_type + '-board',
            type,
            posts: posts,
            user: req.user,
            count: totalPostCount,
            pageSize,
            pageListSize,
            curPage,
            result,
            moment,
            path,
        });

    } catch (error) {
        console.error(error);
        next(error);
    }
});


module.exports = router;
