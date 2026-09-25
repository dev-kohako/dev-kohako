const QUERY = `query($login: String!) {
  user(login: $login) {
    login
    name
    contributionsCollection {
      totalCommitContributions
      totalPullRequestContributions
      totalPullRequestReviewContributions
      totalIssueContributions
      contributionCalendar {
        totalContributions
        weeks { contributionDays { date contributionCount contributionLevel weekday } }
      }
    }
    repositories(first: 100, ownerAffiliations: OWNER, privacy: PUBLIC, isFork: false, orderBy: {field: PUSHED_AT, direction: DESC}) {
      totalCount
      nodes {
        name
        description
        url
        homepageUrl
        stargazerCount
        pushedAt
        isArchived
        primaryLanguage { name color }
        languages(first: 20, orderBy: {field: SIZE, direction: DESC}) { edges { size node { name color } } }
        repositoryTopics(first: 20) { nodes { topic { name } } }
        pkg: object(expression: "HEAD:package.json") { ... on Blob { text } }
        composer: object(expression: "HEAD:composer.json") { ... on Blob { text } }
        root: object(expression: "HEAD:") { ... on Tree { entries { name } } }
      }
    }
  }
}`;

const LEVELS = { NONE: 0, FIRST_QUARTILE: 1, SECOND_QUARTILE: 2, THIRD_QUARTILE: 3, FOURTH_QUARTILE: 4 };

export async function fetchProfile(login, token) {
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: { authorization: `bearer ${token}`, 'content-type': 'application/json', 'user-agent': `${login}-profile` },
    body: JSON.stringify({ query: QUERY, variables: { login } }),
  });
  if (!res.ok) throw new Error(`GitHub GraphQL answered ${res.status}: ${await res.text()}`);
  const json = await res.json();
  const problems = (json.errors ?? []).map((e) => e.message).join('\n');
  // A field GitHub could not resolve (one repo's manifest, say) comes back as
  // an error next to otherwise good data; draw what we have.
  if (!json.data?.user) throw new Error(problems || 'GitHub returned no user');
  if (problems) console.warn(`GitHub reported, drawing anyway:\n${problems}`);
  return json.data.user;
}

const keysOf = (text, ...fields) => {
  try {
    const obj = JSON.parse(text);
    return new Set(fields.flatMap((f) => Object.keys(obj[f] ?? {})));
  } catch {
    return new Set();
  }
};

// Flatten the GraphQL answer into what the cards need.
export function normalize(user) {
  const cc = user.contributionsCollection;
  const days = [];
  cc.contributionCalendar.weeks.forEach((w, i) =>
    w.contributionDays.forEach((d) =>
      days.push({ date: d.date, count: d.contributionCount, level: LEVELS[d.contributionLevel] ?? 0, week: i, weekday: d.weekday }),
    ),
  );

  const stars = user.repositories.nodes.reduce((a, r) => a + r.stargazerCount, 0);
  const repos = user.repositories.nodes
    .filter((r) => r.name !== user.login)
    .map((r) => ({
      name: r.name,
      description: r.description ?? '',
      url: r.url,
      homepage: r.homepageUrl ?? '',
      stars: r.stargazerCount,
      pushedAt: r.pushedAt,
      archived: r.isArchived,
      primary: r.primaryLanguage,
      languages: r.languages.edges.map((e) => ({ name: e.node.name, color: e.node.color, size: e.size })),
      topics: r.repositoryTopics.nodes.map((n) => n.topic.name),
      deps: keysOf(r.pkg?.text, 'dependencies', 'devDependencies'),
      composer: keysOf(r.composer?.text, 'require', 'require-dev'),
      files: new Set((r.root?.entries ?? []).map((e) => e.name)),
    }));

  const bytes = new Map();
  for (const r of repos) for (const l of r.languages) bytes.set(l.name, (bytes.get(l.name) ?? 0) + l.size);
  const totalBytes = [...bytes.values()].reduce((a, b) => a + b, 0) || 1;
  const languages = [...bytes]
    .map(([name, size]) => ({ name, share: size / totalBytes }))
    .sort((a, b) => b.share - a.share);

  return {
    login: user.login,
    calendar: { total: cc.contributionCalendar.totalContributions, days },
    counts: {
      commits: cc.totalCommitContributions,
      prs: cc.totalPullRequestContributions,
      reviews: cc.totalPullRequestReviewContributions,
      issues: cc.totalIssueContributions,
    },
    repos,
    publicRepos: user.repositories.totalCount,
    stars,
    languages,
  };
}

// Does this repo use this periodic-table element? See profile.config.mjs.
export function uses(el, repo) {
  if (el.any) return true;
  const hit = (list, has) => list?.some(has) ?? false;
  const dep = (d) => (d.endsWith('*') ? [...repo.deps].some((x) => x.startsWith(d.slice(0, -1))) : repo.deps.has(d));
  return (
    hit(el.lang, (l) => repo.languages.some((x) => x.name === l)) ||
    hit(el.deps, dep) ||
    hit(el.composer, (c) => repo.composer.has(c)) ||
    hit(el.files, (f) => repo.files.has(f)) ||
    hit(el.topics, (t) => repo.topics.includes(t)) ||
    (el.homepage ? el.homepage.test(repo.homepage) : false)
  );
}

export function streaks(days) {
  const sorted = [...days].sort((a, b) => a.date.localeCompare(b.date));
  let longest = 0, run = 0;
  for (const d of sorted) {
    run = d.count > 0 ? run + 1 : 0;
    longest = Math.max(longest, run);
  }
  // Today is not over yet, so an empty today does not break the streak.
  let i = sorted.length - 1;
  if (i >= 0 && sorted[i].count === 0) i--;
  let current = 0;
  while (i >= 0 && sorted[i].count > 0) {
    current++;
    i--;
  }
  const best = sorted.reduce((m, d) => (d.count > m.count ? d : m), { count: 0, date: '' });
  const active = sorted.filter((d) => d.count > 0).length;
  return { current, longest, best, active, total: sorted.length };
}
