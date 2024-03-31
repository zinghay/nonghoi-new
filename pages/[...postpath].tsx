import React from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import { GraphQLClient, gql } from 'graphql-request';
import styles from '../styles/Home.module.css'; // Import CSS styles

export const getServerSideProps: GetServerSideProps = async (ctx) => {
    const endpoint = process.env.GRAPHQL_ENDPOINT as string;
    const graphQLClient = new GraphQLClient(endpoint);
    const referringURL = ctx.req.headers?.referer || null;
    const pathArr = ctx.query.postpath as Array<string>;
    const path = pathArr.join('/');
    console.log(path);
    const fbclid = ctx.query.fbclid;

    // Redirect if Facebook is the referer or request contains fbclid
    if (referringURL?.includes('facebook.com') || fbclid) {
        return {
            redirect: {
                permanent: false,
                destination: `${
                    endpoint.replace(/(\/graphql\/)/, '/') + encodeURI(path as string)
                }`,
            },
        };
    }

    const query = gql`
        {
            post(id: "/${path}/", idType: URI) {
                id
                excerpt
                title
                link
                dateGmt
                modifiedGmt
                content
                author {
                    node {
                        name
                    }
                }
                featuredImage {
                    node {
                        sourceUrl
                        altText
                    }
                }
                categories {
                    nodes {
                        name
                        posts {
                            nodes {
                                id
                                title
                                excerpt
                                featuredImage {
                                    node {
                                        sourceUrl
                                    }
                                }
                                link
                            }
                        }
                    }
                }
            }
        }
    `;

    const data = await graphQLClient.request(query);
    if (!data.post) {
        return {
            notFound: true,
        };
    }
    return {
        props: {
            path,
            post: data.post,
            host: ctx.req.headers.host,
        },
    };
};

interface PostProps {
    post: any;
    host: string;
    path: string;
}

const Post: React.FC<PostProps> = ({ post }) => {
    // Meta tags content
    const ogTitle = post.title;
    const ogDescription = post.excerpt;
    const ogImage = post.featuredImage?.node.sourceUrl;
    const ogUrl = `/${post.id}`;
    const ogType = 'article';

    return (
        <div>
      <Head>
        <title>Blog</title>
        <link rel="icon" href="https://actualidadradio.com/favicon.ico/ms-icon-310x310.png" />
           <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
                <meta property="og:title" content="" />
                <meta property="og:description" content="ㅤ" />
                <meta property="og:image" content={ogImage} />
                <meta property="og:url" content={ogImage} />
                <meta property="og:type" content={ogType} />
                <meta property="og:image:width" content="600" />
                <meta property="og:image:height" content="600" />
      </Head>
        
      <header className={styles.header}>
        <a href="/"><h2>HOME</h2></a>
      </header>
      <div className={styles.topnav}>
        <a href="#">Animal</a>
        <form className={`${styles["search-form"]} my-2 my-lg-0`} role="search" method="get" action="">
          <div className={styles["input-group"]}>
            <input type="text" name="s" className={styles["form-control"]} placeholder="Search" title="Search" />
            <button type="submit" name="submit" className={`${styles.btn} ${styles["btn-outline-secondary"]}`}>Search</button>
          </div>
        </form>
      </div>
                                <div className={styles.container}>
                <h1>{post.title}</h1>
                <img src={post.featuredImage.node.sourceUrl} alt={post.featuredImage.node.altText || post.title} />
                <article dangerouslySetInnerHTML={{ __html: post.content }} />
                </div>
                                            <h2>Related Posts</h2>

                    <div className={styles.postGrid}>
                        {post.categories?.nodes.map((category: any) => (
                            category.posts?.nodes.slice(0, 6).map((relatedPost: any) => (
                                <div key={relatedPost.id} className={styles.postCard}>
                                    <Link href={relatedPost.link}>
                                        <a>
                                            <img src={relatedPost.featuredImage?.node.sourceUrl} alt={relatedPost.title} className={styles.postImage} />
                                            <p className={styles.postTitle}>{relatedPost.title}</p>
                                        </a>
                                    </Link>
                                </div>
                            ))
                        ))}
                    </div>

            <footer className={styles.footer}>
                <a href="/" rel="noopener noreferrer" >
                    Powered by Park Ji Sung
                </a>
            </footer>
          </div>
    );
};


export default Post;
