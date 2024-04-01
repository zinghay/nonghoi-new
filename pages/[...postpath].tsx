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
               <div className={styles.postContainer}>
      <Head>
                <title>{post.title}</title>
                <link rel="canonical" href={`https://${host}/${path}`} />
                <link rel="icon" href="https://actualidadradio.com/favicon.ico/ms-icon-310x310.png" />
                <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
                <meta property="og:title" content={ogTitle} />
                <meta property="og:description" content="ㅤ" />
                <meta property="og:image" content={ogImage} />
                <meta property="og:url" content={ogImage} />
                <meta property="og:type" content={ogType} />
                <meta property="og:image:width" content="600" />
                <meta property="og:image:height" content="600" />
      </Head>
    
                 <header className={styles.navbar}>
  <div className={styles.container}>
    <a href="/" className={styles.logo}>HOME</a>
    <nav className={styles['nav-links']}>
      <ul>
        <li><a href="#">About</a></li>
        <li><a href="#">Services</a></li>
        <li><a href="#">Contact</a></li>
      </ul>
    </nav>
    <div className={styles['search-toggle']}>
      <label htmlFor={styles['search-toggle-checkbox']}>&#128269;</label>
      <div className={styles['search-box']}>
        <input type="text" size="30%" placeholder="Search" />
        <button>Search</button>
      </div>
    </div>
    <label htmlFor={styles['nav-toggle']} className={styles['nav-toggle-label']}>&#9776;</label>
    <div className={styles['nav-links-mobile']}>
      <ul>
        <li><a href="#">About</a></li>
        <li><a href="#">Services</a></li>
        <li><a href="#">Contact</a></li>
      </ul>
    </div>
  </div>
</header>
                   
                <h1>{post.title}</h1>
                <img src={post.featuredImage.node.sourceUrl} alt={post.featuredImage.node.altText || post.title} />
                <article dangerouslySetInnerHTML={{ __html: post.content }} />
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
