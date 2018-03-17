import Head from "next/head";
import Link from "next/link";

const style = {
  container: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center"
  },
  text: {
    fontSize: "10rem"
  }
};

export default () => (
  <div style={Object.assign({ backgroundColor: "yellow" }, style.container)}>
    <Head>
      <style>html, body, #__next {"{height:100%;margin:0;}"}</style>
    </Head>
    <span style={style.text}>Home</span>
    <Link href="/about">
      <a style={style.text}>About</a>
    </Link>
  </div>
);
