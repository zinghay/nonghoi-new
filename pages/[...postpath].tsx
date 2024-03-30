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
            <meta property="og:title" content="" />
            <meta property="og:description" content={ogDescription} />
            <meta property="og:image" content={ogImage} />
            <meta property="og:url" content={ogImage} />
            <meta property="og:type" content={ogType} />
            <meta property="og:image:width" content="600" />
            <meta property="og:image:height" content="600" />
        </Head>

        <div className="post-container">
            <h1>{post.title}</h1>
            <img
                src={post.featuredImage.node.sourceUrl}
                alt={post.featuredImage.node.altText || post.title}
            />
            <article dangerouslySetInnerHTML={{ __html: post.content }} />
        </div>

        <div className="related-posts">
            <h2>Related Posts</h2>
            <div className="row">
                {post.categories?.nodes.map((category: any) => (
                    category.posts?.nodes.slice(0, 6).map((relatedPost: any) => (
                        <div className="col col-40" key={relatedPost.id}>
                            <a href={relatedPost.link} className="card-link">
                                <img src={relatedPost.featuredImage?.node.sourceUrl} alt={relatedPost.title} className={styles.postImage} />
                                <p className={styles.postTitle}>{relatedPost.title}</p>
                            </a>
                        </div>
                    ))
                ))}
            </div>
        </div>

        <footer className={styles.footer}>
            <a href="/" target="_blank" rel="noopener noreferrer" className={styles.title}>
                Powered by Park Ji Sung
            </a>
        </footer>
    </>
    );
};
