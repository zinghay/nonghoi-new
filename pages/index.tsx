import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { GetServerSideProps } from 'next';
import { GraphQLClient, gql } from 'graphql-request';

export const getServerSideProps: GetServerSideProps = async (ctx) => {
    try {
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
                    destination: `${endpoint.replace(/(\/graphql\/)/, '/') + encodeURI(path as string)}`,
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
    } catch (error) {
        console.error('Error fetching data:', error);
        return {
            notFound: true,
        };
    }
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
    const ogImage = post.featuredImage?.node?.sourceUrl || '';
    const ogUrl = post.link || '';
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

            <div className="post-container">
                <h1>{post.title}</h1>
                <img src={post.featuredImage?.node?.sourceUrl} alt={post.featuredImage?.node?.altText || post.title} />
                <article dangerouslySetInnerHTML={{ __html: post.content }} />

                {/* Hiển thị các bài viết liên quan */}
                <div className="related-posts">
                    <h2>Bài viết liên quan</h2>
                    <ul>
                        {/* Hiển thị danh sách các bài viết liên quan */}
                        {post.categories.nodes.map((category: { name: string }) => (
                            <li key={category.name}>
                                <h3>{category.name}</h3>
                                <ul>
                                    {post.categories.nodes
                                        .filter((node: { name: string }) => node.name !== category.name)
                                        .map((relatedPost: { name: string }) => (
                                            <li key={relatedPost.name}>
                                                <Link href={`/${relatedPost.name.toLowerCase()}`}>
                                                    <a>{relatedPost.name}</a>
                                                </Link>
                                            </li>
                                        ))}
                                </ul>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </>
    );
};

export default Post;
