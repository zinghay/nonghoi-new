import React from 'react';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import { GraphQLClient, gql } from 'graphql-request';

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


// Component function
const Post = (props) => {

  const { post } = props;

  // Meta tags content
  const ogTitle = post.title;
  const ogDescription = removeTags(post.excerpt);
  const ogImage = post.featuredImage.node.sourceUrl; 
  const ogUrl = '/' + post.id;
  const ogType = 'article';
  
  return (
    <>
      <Head>
        <meta property="og:title" content={ogTitle} />
        
        <meta 
          property="og:description"
          content={ogDescription}
        />

        <meta
          property="og:image" 
          content={ogImage}
        />

        <meta
          property="og:url"
          content={ogUrl} 
        />

        <meta
          property="og:type"  
          content={ogType}
        />

        <meta
          property="og:image:width"
          content="600"
        />

        <meta
          property="og:image:height"
          content="338" 
        />
      </Head>

      {/* Component content */}

    </>
  )
}

// Component export


			<div className="post-container">
				<h1>{post.title}</h1>
				<img
					src={post.featuredImage.node.sourceUrl}
					alt={post.featuredImage.node.altText || post.title}
				/>
				<article dangerouslySetInnerHTML={{ __html: post.content }} />
			</div>
		</>
	);
};

export default Post;
