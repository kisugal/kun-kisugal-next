# Perf Compare: baseline vs optimized

Typecheck: FAIL -> FAIL
Build: PASS -> PASS

| Route | Score Δ | FCP Δ(ms) | LCP Δ(ms) | TBT Δ(ms) | CLS Δ | Speed Index Δ(ms) | Data Requests Δ | Duplicate Requests Δ |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| home | 15.00 | 0.36 | 22.54 | -489.00 | 0.0000 | -1159.59 | 0 | 0 |
| galgame | 1.00 | -34.11 | -49.77 | -5.61 | 0.0000 | -10.48 | 0 | 0 |
| resource | 1.00 | -26.96 | 5.33 | -28.00 | 0.0000 | -214.44 | 0 | 0 |
| topic-list | 15.00 | 151.91 | -2660.41 | 13.50 | -0.0247 | -805.46 | -1 | 0 |
| patch-detail | 0.00 | -298.01 | 148.05 | -3.42 | 0.0000 | -713.19 | 0 | 0 |
| topic-detail | 11.00 | 0.46 | 2108.37 | 15.53 | -0.7940 | -271.97 | -1 | 0 |
