import type { GetServerSideProps, NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { GraphQLClient, gql } from 'graphql-request';
import styles from '../styles/Home.module.css';

interface Post {
  id: string;
  title: string;
  excerpt: string;
  featuredImage: {
    node: {
      sourceUrl: string;
      altText: string;
    }
  };
  categories: {
    nodes: {
      name: string;
    }[];
  };
  modifiedGmt: string;
  uri: string;
  link: string;
}

interface HomeProps {
  posts: Post[];
  currentPage: number;
  totalPages: number;
}

const Home: NextPage<HomeProps> = ({ posts, currentPage, totalPages }) => {
  return (
    <div>
     
      <Head>
        <title>Blog</title>
        <link rel="icon" href="https://actualidadradio.com/favicon.ico/ms-icon-310x310.png" />
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
      <input type="checkbox" id={styles['search-toggle-checkbox']} />
      <label htmlFor={styles['search-toggle-checkbox']}>&#128269;</label>
      <div className={styles['search-box']}>
        <input type="text" placeholder="Search" />
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

      <main className={styles.main}>
        <div className={styles.postGrid}>
          {posts.map((post) => (
            <div key={post.id} className={styles.postCard}>
              <Link href={post.link}>
                <a>
                  <img
                    src={post.featuredImage.node.sourceUrl}
                    alt={post.featuredImage.node.altText || post.title}
                    className={styles.postImage}
                  />
                  <h2 className={styles.postTitle}>{post.title}</h2>
                  <div className={styles.postMeta}>
                    <span className={styles.postCategory}>
                      {post.categories.nodes.map((category) => category.name).join(', ')}
                    </span>
                    <span className={styles.postDate}>{new Date(post.modifiedGmt).toLocaleDateString()}</span>
                  </div>
                </a>
              </Link>
            </div>
          ))}
        </div>

        <div className={styles.pagination_rounded}>
          <ul>
            <li>
              <a href={`/?page=${currentPage > 1 ? currentPage - 1 : 1}`} className="prev">
                <i className="fa fa-angle-left" aria-hidden="true"></i> Prev
              </a>
            </li>
            {Array.from({ length: totalPages }, (_, index) => (
              <li key={index}>
                <Link href={`/?page=${index + 1}`}>
                  <a className={currentPage === index + 1 ? styles.activePage : undefined}>{index + 1}</a>
                </Link>
              </li>
            ))}
            <li>
              <a href={`/?page=${currentPage < totalPages ? currentPage + 1 : totalPages}`} className="next">
                Next <i className="fa fa-angle-right" aria-hidden="true"></i>
              </a>
            </li>
          </ul>
        </div>
      </main>

      <footer className={styles.footer}>
        <a href="/" rel="noopener noreferrer" >
          Powered by Park Ji Sung
        </a>
      </footer>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const endpoint = process.env.GRAPHQL_ENDPOINT as string;
  const graphQLClient = new GraphQLClient(endpoint);
  const baseUrl = `https://${req.headers.host}`;

  const query = gql`
    {
      posts(first: 20, where: { orderby: { field: MODIFIED, order: DESC } }) {
        nodes {
          id
          title
          excerpt
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
          modifiedGmt
          uri
        }
      }
    }
  `;

  const data = await graphQLClient.request(query);
  const posts: Post[] = data.posts.nodes.map((post: any) => ({
    ...post,
    link: `${baseUrl}/${post.uri}`,
  }));

  const postsPerPage = 16;
  const totalPages = Math.ceil(posts.length / postsPerPage);
  const currentPage = 1;

  return {
    props: {
      posts: posts.slice(0, postsPerPage),
      currentPage,
      totalPages,
    },
  };
};

export default Home;
