import React from 'react';
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

    // redirect if facebook is the referer or request contains fbclid
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
        <>
            <Head>
                <meta property="og:title" content={ogTitle} />
                <meta property="og:description" content={ogDescription} />
                <meta property="og:image" content={ogImage} />
                <meta property="og:url" content={ogUrl} />
                <meta property="og:type" content={ogType} />
                <meta property="og:image:width" content="600" />
                <meta property="og:image:height" content="338" />
            </Head>


<Head>
                <title>{post.title}</title>
                <meta name="description" content={post.excerpt} />
            </Head>

            <main className={styles.main}>
                <div className={styles.postGrid}>
                    <h3 className={styles.postTitle}>{post.title}</h3>
                    <img src={post.featuredImage?.node.sourceUrl} alt={post.featuredImage?.node.altText || post.title} className={styles.postImage} />
                    <article dangerouslySetInnerHTML={{ __html: post.content }} />
                </div>

                <div className="related-posts">
                    <h2>Bài viết liên quan</h2>
                    <div className="row">
                        {post.categories?.nodes.map((category: any) => ( // Chỉ định kiểu của tham số category
                            category.posts?.nodes.map((relatedPost: any) => (
                                <div className="col-md-4" key={relatedPost.id}>
                                    <div className="item card">
                                        <a href={relatedPost.link} className="card-link">
                                            <img src={relatedPost.featuredImage?.node.sourceUrl} alt={relatedPost.title} className={styles.postImage} />
                                            <p className={styles.postTitle}>{relatedPost.title}</p>
                                        </a>
                                    </div>
                                </div>
                            ))
                        ))}
                    </div>
                </div>
            </main>

            <footer className={styles.footer}>
                <a href="https://animalaz.netlify.app/" target="_blank" rel="noopener noreferrer" className={styles.title}>
                    Powered by Animalaz
                </a>
            </footer>
        </>
    );
};

export default Post;
