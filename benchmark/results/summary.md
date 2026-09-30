Runs compared: 30 (5 tasks × 2 repeats × 3 modes).

| Mode | Passed | Cost | vs xhigh | Tokens | vs xhigh | Output tokens | Time | vs xhigh |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| xhigh | 10/10 | $4.58 | — | 3,759,264 | — | 107,342 | 16.0 min | — |
| medium | 10/10 | $2.84 | −38% | 2,225,473 | −41% | 54,223 | 7.6 min | −52% |
| trimtab | 10/10 | $2.91 | −36% | 2,352,500 | −37% | 54,877 | 7.8 min | −51% |

Per task (mean per run):

| Task | xhigh cost | xhigh time | xhigh passed | medium cost | medium time | medium passed | trimtab cost | trimtab time | trimtab passed |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 01-rename | $0.17 | 0.4 min | 2/2 | $0.17 | 0.4 min | 2/2 | $0.17 | 0.4 min | 2/2 |
| 02-currency | $0.28 | 0.8 min | 2/2 | $0.29 | 0.7 min | 2/2 | $0.31 | 0.8 min | 2/2 |
| 03-delivery | $0.48 | 1.8 min | 2/2 | $0.25 | 0.7 min | 2/2 | $0.23 | 0.6 min | 2/2 |
| 04-invoice-tax | $0.80 | 3.2 min | 2/2 | $0.31 | 0.9 min | 2/2 | $0.34 | 1.0 min | 2/2 |
| 05-shipping | $0.56 | 1.9 min | 2/2 | $0.40 | 1.1 min | 2/2 | $0.41 | 1.1 min | 2/2 |

The same work that keeps a xhigh session busy for 5 hours:

| Mode | Cost | Tokens | Agent time |
| --- | --- | --- | --- |
| xhigh | $85.76 | 70,327,816 | 5.0 h |
| medium | $53.09 | 41,633,856 | 2.4 h |
| trimtab | $54.53 | 44,010,260 | 2.4 h |
